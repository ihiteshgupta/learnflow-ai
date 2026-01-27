import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { PromptTemplate } from '@langchain/core/prompts';
import { getModelForAgent } from '../models';
import { ASSESSOR_SYSTEM_PROMPT, QUESTION_GENERATION_PROMPT, ANSWER_EVALUATION_PROMPT } from '../prompts/assessor-prompts';
import type { AgentState } from '../types';

const systemPromptTemplate = PromptTemplate.fromTemplate(ASSESSOR_SYSTEM_PROMPT);
const questionGenTemplate = PromptTemplate.fromTemplate(QUESTION_GENERATION_PROMPT);
const answerEvalTemplate = PromptTemplate.fromTemplate(ANSWER_EVALUATION_PROMPT);

interface Question {
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hint: string;
  points: number;
}

export const assessorAgent = {
  name: 'assessor',

  async invoke(state: AgentState): Promise<{
    messages: AIMessage[];
    metadata: Record<string, unknown>;
  }> {
    const model = getModelForAgent('assessor');

    const systemPrompt = await systemPromptTemplate.format({
      level: state.userProfile.level,
      avgScore: state.userProfile.avgScore,
      struggleAreas: state.userProfile.struggleAreas.join(', ') || 'none',
      topic: state.lessonContext.topic,
      objectives: state.lessonContext.objectives.join(', '),
      ragContext: state.ragContext || 'No specific content loaded.',
    });

    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      ...state.messages,
    ]);

    return {
      messages: [new AIMessage(response.content.toString())],
      metadata: {
        agentType: 'assessor',
      },
    };
  },

  async generateQuestions(
    topic: string,
    objectives: string[],
    options: {
      count?: number;
      difficulty?: number;
      types?: string[];
    } = {}
  ): Promise<Question[]> {
    const model = getModelForAgent('assessor');
    const { count = 5, difficulty = 5, types = ['multiple_choice', 'code_output'] } = options;

    const prompt = await questionGenTemplate.format({
      count,
      topic,
      difficulty,
      objectives: objectives.join(', '),
      types: types.join(', '),
    });

    const response = await model.invoke([
      new SystemMessage('You are a question generator. Output valid JSON only.'),
      new HumanMessage(prompt),
    ]);

    try {
      const content = response.content.toString();
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch {
      console.error('Failed to parse questions:', response.content);
      return [];
    }
  },

  async evaluateAnswer(
    question: string,
    studentAnswer: string,
    correctAnswer: string,
    maxPoints: number
  ): Promise<{
    correct: 'yes' | 'partial' | 'no';
    score: number;
    feedback: string;
  }> {
    const model = getModelForAgent('assessor');

    const prompt = await answerEvalTemplate.format({
      question,
      answer: studentAnswer,
      correctAnswer,
      maxPoints,
    });

    const response = await model.invoke([
      new SystemMessage('Evaluate the answer and respond with JSON: { "correct": "yes|partial|no", "score": number, "feedback": "string" }'),
      new HumanMessage(prompt),
    ]);

    try {
      const content = response.content.toString();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.error('Failed to parse evaluation:', response.content);
    }

    return {
      correct: 'no',
      score: 0,
      feedback: 'Unable to evaluate answer.',
    };
  },
};
