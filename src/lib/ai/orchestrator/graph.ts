import { Annotation, StateGraph, END, START } from '@langchain/langgraph';
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import { tutorAgent } from '../agents/tutor';
import { assessorAgent } from '../agents/assessor';
import { codeReviewAgent } from '../agents/code-review';
import { mentorAgent } from '../agents/mentor';
import { projectGuideAgent } from '../agents/project-guide';
import { routeToAgent } from './router';
import type { AgentType, LessonContext, UserProfile, AgentState } from '../types';

// Define the state using Annotation
const GraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (a, b) => [...a, ...b],
    default: () => [],
  }),
  currentAgent: Annotation<AgentType>({
    reducer: (_, b) => b,
    default: () => 'tutor',
  }),
  lessonContext: Annotation<LessonContext>({
    reducer: (_, b) => b,
    default: () => ({
      lessonId: '',
      topic: '',
      courseId: '',
      objectives: [],
      teachingMode: 'adaptive' as const,
    }),
  }),
  userProfile: Annotation<UserProfile>({
    reducer: (_, b) => b,
    default: () => ({
      id: '',
      level: 1,
      learningStyle: 'adaptive',
      struggleAreas: [],
      interests: [],
      avgScore: 0,
    }),
  }),
  ragContext: Annotation<string>({
    reducer: (_, b) => b,
    default: () => '',
  }),
  shouldContinue: Annotation<boolean>({
    reducer: (_, b) => b,
    default: () => true,
  }),
  metadata: Annotation<Record<string, unknown>>({
    reducer: (a, b) => ({ ...a, ...b }),
    default: () => ({}),
  }),
});

type GraphStateType = typeof GraphState.State;

// Convert graph state to agent state
function toAgentState(state: GraphStateType): AgentState {
  return {
    messages: state.messages as (HumanMessage | AIMessage | SystemMessage)[],
    currentAgent: state.currentAgent,
    lessonContext: state.lessonContext,
    userProfile: state.userProfile,
    ragContext: state.ragContext,
    shouldContinue: state.shouldContinue,
    metadata: state.metadata,
  };
}

// Agent execution functions
async function routerNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const agentState = toAgentState(state);
  const nextAgent = routeToAgent(agentState);
  return { currentAgent: nextAgent };
}

async function tutorNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const result = await tutorAgent.invoke(toAgentState(state));
  return {
    messages: result.messages,
    metadata: result.metadata,
  };
}

async function assessorNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const result = await assessorAgent.invoke(toAgentState(state));
  return {
    messages: result.messages,
    metadata: result.metadata,
  };
}

async function codeReviewNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const result = await codeReviewAgent.invoke(toAgentState(state));
  return {
    messages: result.messages,
    metadata: result.metadata,
  };
}

async function mentorNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const result = await mentorAgent.invoke(toAgentState(state));
  return {
    messages: result.messages,
    metadata: result.metadata,
  };
}

async function projectGuideNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const result = await projectGuideAgent.invoke(toAgentState(state));
  return {
    messages: result.messages,
    metadata: result.metadata,
  };
}

// Route function for conditional edges
function routeAfterRouter(state: GraphStateType): string {
  return state.currentAgent;
}

// Create the graph
export function createOrchestratorGraph() {
  const workflow = new StateGraph(GraphState)
    .addNode('router', routerNode)
    .addNode('tutor', tutorNode)
    .addNode('assessor', assessorNode)
    .addNode('codeReview', codeReviewNode)
    .addNode('mentor', mentorNode)
    .addNode('projectGuide', projectGuideNode)
    .addEdge(START, 'router')
    .addConditionalEdges('router', routeAfterRouter, {
      tutor: 'tutor',
      assessor: 'assessor',
      codeReview: 'codeReview',
      mentor: 'mentor',
      projectGuide: 'projectGuide',
    })
    .addEdge('tutor', END)
    .addEdge('assessor', END)
    .addEdge('codeReview', END)
    .addEdge('mentor', END)
    .addEdge('projectGuide', END);

  return workflow.compile();
}

export type OrchestratorGraph = ReturnType<typeof createOrchestratorGraph>;
export { GraphState };
