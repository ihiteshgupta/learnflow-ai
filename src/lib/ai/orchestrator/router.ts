import type { AgentState, AgentType } from '../types';

const INTENT_PATTERNS: Record<AgentType, RegExp[]> = {
  codeReview: [
    /review (my |this )?code/i,
    /check (my |this )?code/i,
    /what('s| is) wrong with/i,
    /debug/i,
    /fix this/i,
  ],
  mentor: [
    /career/i,
    /motivation/i,
    /stuck/i,
    /frustrated/i,
    /give up/i,
    /should i/i,
    /advice/i,
    /overwhelmed/i,
  ],
  projectGuide: [
    /project/i,
    /build/i,
    /portfolio/i,
    /deploy/i,
    /architecture/i,
    /structure/i,
  ],
  assessor: [
    /quiz/i,
    /test me/i,
    /question/i,
    /assess/i,
    /evaluate/i,
    /check my understanding/i,
  ],
  quizGenerator: [
    /generate (a )?quiz/i,
    /create questions/i,
    /practice problems/i,
  ],
  tutor: [], // Default
  orchestrator: [],
};

export function routeToAgent(state: AgentState): AgentType {
  const lastMessage = state.messages[state.messages.length - 1];
  const content = lastMessage.content.toString().toLowerCase();

  // Check each agent's patterns
  for (const [agent, patterns] of Object.entries(INTENT_PATTERNS)) {
    if (agent === 'tutor' || agent === 'orchestrator') continue;

    for (const pattern of patterns) {
      if (pattern.test(content)) {
        return agent as AgentType;
      }
    }
  }

  // Default to tutor
  return 'tutor';
}

export function shouldContinue(state: AgentState): 'continue' | 'end' {
  // Check if we should continue the conversation
  if (!state.shouldContinue) {
    return 'end';
  }

  // Check for explicit end signals
  const lastMessage = state.messages[state.messages.length - 1];
  const content = lastMessage.content.toString().toLowerCase();

  const endSignals = ['goodbye', 'bye', 'thanks, that', "that's all", 'done for now'];
  if (endSignals.some((signal) => content.includes(signal))) {
    return 'end';
  }

  return 'continue';
}
