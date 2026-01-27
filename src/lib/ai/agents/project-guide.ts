import { AIMessage, SystemMessage } from '@langchain/core/messages';
import { PromptTemplate } from '@langchain/core/prompts';
import { getModelForAgent } from '../models';
import { PROJECT_GUIDE_SYSTEM_PROMPT } from '../prompts/project-guide-prompts';
import type { AgentState } from '../types';

const systemPromptTemplate = PromptTemplate.fromTemplate(PROJECT_GUIDE_SYSTEM_PROMPT);

export const projectGuideAgent = {
  name: 'projectGuide',

  async invoke(state: AgentState): Promise<{
    messages: AIMessage[];
    metadata: Record<string, unknown>;
  }> {
    const model = getModelForAgent('projectGuide');

    const projectData = state.metadata.project as {
      name?: string;
      milestone?: string;
      requirements?: string;
    } || {};

    const systemPrompt = await systemPromptTemplate.format({
      level: state.userProfile.level,
      projectName: projectData.name || 'Portfolio Project',
      milestone: projectData.milestone || 'Planning',
      requirements: projectData.requirements || 'Standard project requirements',
      ragContext: state.ragContext || '',
    });

    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      ...state.messages,
    ]);

    return {
      messages: [new AIMessage(response.content.toString())],
      metadata: {
        agentType: 'projectGuide',
      },
    };
  },
};
