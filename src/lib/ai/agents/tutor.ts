import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { PromptTemplate } from '@langchain/core/prompts';
import { getModelForAgent } from '../models';
import { TUTOR_SYSTEM_PROMPT } from '../prompts/tutor-prompts';
import type { AgentState, TeachingMode } from '../types';

const systemPromptTemplate = PromptTemplate.fromTemplate(TUTOR_SYSTEM_PROMPT);

function detectConfusion(messages: (HumanMessage | AIMessage | SystemMessage)[]): boolean {
  const recentMessages = messages.slice(-4);
  const userMessages = recentMessages
    .filter((m): m is HumanMessage => m instanceof HumanMessage)
    .map((m) => m.content.toString().toLowerCase());

  const confusionSignals = [
    "i don't understand",
    "i'm confused",
    "what do you mean",
    "can you explain",
    "i'm lost",
    "this doesn't make sense",
    "huh?",
    "???",
  ];

  return userMessages.some((msg) =>
    confusionSignals.some((signal) => msg.includes(signal))
  );
}

function suggestModeChange(
  currentMode: TeachingMode,
  isConfused: boolean,
  messageCount: number
): TeachingMode | undefined {
  if (isConfused && currentMode === 'socratic') {
    return 'adaptive'; // Switch to direct explanation
  }
  if (!isConfused && messageCount > 10 && currentMode === 'adaptive') {
    return 'socratic'; // Try Socratic if student is doing well
  }
  return undefined;
}

export const tutorAgent = {
  name: 'tutor',

  async invoke(state: AgentState): Promise<{
    messages: AIMessage[];
    metadata: Record<string, unknown>;
  }> {
    const model = getModelForAgent('tutor');

    const isConfused = detectConfusion(state.messages);
    const suggestedMode = suggestModeChange(
      state.lessonContext.teachingMode,
      isConfused,
      state.messages.length
    );

    const systemPrompt = await systemPromptTemplate.format({
      level: state.userProfile.level,
      learningStyle: state.userProfile.learningStyle || 'adaptive',
      struggleAreas: state.userProfile.struggleAreas.join(', ') || 'none identified',
      topic: state.lessonContext.topic,
      objectives: state.lessonContext.objectives.join(', '),
      teachingMode: state.lessonContext.teachingMode.toUpperCase(),
      ragContext: state.ragContext || 'No specific content loaded.',
    });

    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      ...state.messages,
    ]);

    const content = response.content.toString();

    // Extract concepts mentioned in response
    const conceptsCovered: string[] = [];
    state.lessonContext.objectives.forEach((obj) => {
      if (content.toLowerCase().includes(obj.toLowerCase().split(' ')[0])) {
        conceptsCovered.push(obj);
      }
    });

    return {
      messages: [new AIMessage(content)],
      metadata: {
        agentType: 'tutor',
        teachingMode: state.lessonContext.teachingMode,
        detectedConfusion: isConfused,
        suggestedMode,
        conceptsCovered,
      },
    };
  },
};
