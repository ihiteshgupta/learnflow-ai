import { AIMessage, SystemMessage } from '@langchain/core/messages';
import { PromptTemplate } from '@langchain/core/prompts';
import { getModelForAgent } from '../models';
import { MENTOR_SYSTEM_PROMPT } from '../prompts/mentor-prompts';
import type { AgentState } from '../types';

const systemPromptTemplate = PromptTemplate.fromTemplate(MENTOR_SYSTEM_PROMPT);

export const mentorAgent = {
  name: 'mentor',

  async invoke(state: AgentState): Promise<{
    messages: AIMessage[];
    metadata: Record<string, unknown>;
  }> {
    const model = getModelForAgent('mentor');

    const systemPrompt = await systemPromptTemplate.format({
      level: state.userProfile.level,
      streak: state.metadata.currentStreak || 0,
      goals: (state.metadata.goals as string[])?.join(', ') || 'Not specified',
      interests: state.userProfile.interests.join(', ') || 'Not specified',
      ragContext: state.ragContext || '',
    });

    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      ...state.messages,
    ]);

    return {
      messages: [new AIMessage(response.content.toString())],
      metadata: {
        agentType: 'mentor',
      },
    };
  },
};
