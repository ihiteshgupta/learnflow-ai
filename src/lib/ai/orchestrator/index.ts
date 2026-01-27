import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { createOrchestratorGraph, GraphState } from './graph';
import { retrieveForLesson } from '../rag/retriever';
import type { UserProfile, LessonContext } from '../types';

let graphInstance: ReturnType<typeof createOrchestratorGraph> | null = null;

function getGraph() {
  if (!graphInstance) {
    graphInstance = createOrchestratorGraph();
  }
  return graphInstance;
}

export interface ChatOptions {
  lessonId?: string;
  userProfile: UserProfile;
  lessonContext: LessonContext;
  previousMessages?: (HumanMessage | AIMessage)[];
}

export async function chat(
  userMessage: string,
  options: ChatOptions
): Promise<{
  response: string;
  agentType: string;
  metadata: Record<string, unknown>;
}> {
  const graph = getGraph();

  // Retrieve RAG context
  const ragContext = options.lessonId
    ? await retrieveForLesson(options.lessonId, userMessage)
    : '';

  // Build initial state
  const initialState: typeof GraphState.State = {
    messages: [
      ...(options.previousMessages || []),
      new HumanMessage(userMessage),
    ],
    currentAgent: 'tutor',
    lessonContext: options.lessonContext,
    userProfile: options.userProfile,
    ragContext,
    shouldContinue: true,
    metadata: {},
  };

  // Run the graph
  const result = await graph.invoke(initialState);

  // Extract the last AI message
  const messages = result.messages || [];
  const lastMessage = messages[messages.length - 1];
  const response = lastMessage instanceof AIMessage
    ? lastMessage.content.toString()
    : '';

  const metadata = (result.metadata || {}) as Record<string, unknown>;

  return {
    response,
    agentType: (metadata.agentType as string) || 'tutor',
    metadata,
  };
}

export { createOrchestratorGraph };
