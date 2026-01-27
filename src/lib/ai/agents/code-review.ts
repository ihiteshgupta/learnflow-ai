import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { PromptTemplate } from '@langchain/core/prompts';
import { getModelForAgent } from '../models';
import { CODE_REVIEW_SYSTEM_PROMPT, CODE_ANALYSIS_PROMPT } from '../prompts/code-review-prompts';
import type { AgentState } from '../types';

const systemPromptTemplate = PromptTemplate.fromTemplate(CODE_REVIEW_SYSTEM_PROMPT);
const analysisTemplate = PromptTemplate.fromTemplate(CODE_ANALYSIS_PROMPT);

interface CodeReviewResult {
  overallAssessment: string;
  positives: string[];
  improvements: string[];
  resources: string[];
  score: number; // 0-100
}

export const codeReviewAgent = {
  name: 'codeReview',

  async invoke(state: AgentState): Promise<{
    messages: AIMessage[];
    metadata: Record<string, unknown>;
  }> {
    const model = getModelForAgent('codeReview');

    const systemPrompt = await systemPromptTemplate.format({
      level: state.userProfile.level,
      language: state.lessonContext.language || 'python',
      ragContext: state.ragContext || 'No specific content loaded.',
    });

    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      ...state.messages,
    ]);

    return {
      messages: [new AIMessage(response.content.toString())],
      metadata: {
        agentType: 'codeReview',
      },
    };
  },

  async reviewCode(
    code: string,
    language: string,
    objective: string,
    studentLevel: number,
    ragContext?: string
  ): Promise<CodeReviewResult> {
    const model = getModelForAgent('codeReview');

    const systemPrompt = await systemPromptTemplate.format({
      level: studentLevel,
      language,
      ragContext: ragContext || 'General code review.',
    });

    const analysisPrompt = await analysisTemplate.format({
      language,
      code,
      objective,
    });

    const response = await model.invoke([
      new SystemMessage(systemPrompt + '\n\nRespond with JSON in this format: { "overallAssessment": "", "positives": [], "improvements": [], "resources": [], "score": 0 }'),
      new HumanMessage(analysisPrompt),
    ]);

    try {
      const content = response.content.toString();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.error('Failed to parse code review:', response.content);
    }

    return {
      overallAssessment: response.content.toString(),
      positives: [],
      improvements: [],
      resources: [],
      score: 50,
    };
  },
};
