import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { getModelForAgent } from '../models';
import {
  QUIZ_GENERATOR_SYSTEM_PROMPT,
  QUIZ_GENERATION_PROMPT,
  EXAM_GENERATION_PROMPT,
  SINGLE_QUESTION_PROMPT,
} from '../prompts/quiz-generator-prompts';
import type { AgentState } from '../types';

// Question Types
export const QuestionTypeEnum = z.enum([
  'multiple_choice',
  'code_output',
  'bug_finding',
  'code_completion',
  'conceptual',
  'true_false',
  'ordering',
]);

export type QuestionType = z.infer<typeof QuestionTypeEnum>;

// Question Schema
export const QuestionSchema = z.object({
  id: z.string(),
  type: QuestionTypeEnum,
  question: z.string(),
  codeBlock: z.string().optional(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string(),
  explanation: z.string(),
  hint: z.string(),
  difficulty: z.number().min(1).max(10),
  points: z.number().positive(),
  tags: z.array(z.string()).optional(),
  timeEstimate: z.number().optional(),
  section: z.string().optional(),
  partialCreditRubric: z.string().optional(),
});

export type Question = z.infer<typeof QuestionSchema>;

// Quiz Schema
export const QuizSchema = z.object({
  title: z.string(),
  description: z.string(),
  questions: z.array(QuestionSchema),
  totalPoints: z.number().positive(),
  passingScore: z.number().min(0).max(100),
  timeLimit: z.number().positive(),
  tags: z.array(z.string()).optional(),
  certificationTier: z.enum(['bronze', 'silver', 'gold', 'platinum']).optional(),
  sections: z.array(z.string()).optional(),
  allowReview: z.boolean().optional(),
  shuffleQuestions: z.boolean().optional(),
  shuffleOptions: z.boolean().optional(),
});

export type Quiz = z.infer<typeof QuizSchema>;

// Options interfaces
export interface QuizGenerationOptions {
  count: number;
  difficulty: number;
  topic: string;
  questionTypes?: QuestionType[];
  focusAreas?: string[];
  timePerQuestion?: number;
  courseName?: string;
  moduleName?: string;
  objectives?: string[];
  ragContext?: string;
}

export interface ExamGenerationOptions {
  count: number;
  passingScore: number;
  timeLimit: number;
  certificationTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  topic: string;
  courseName?: string;
  moduleName?: string;
  objectives?: string[];
  ragContext?: string;
}

export interface SingleQuestionOptions {
  topic: string;
  type: QuestionType;
  difficulty: number;
  ragContext?: string;
}

// Prompt templates
const systemPromptTemplate = PromptTemplate.fromTemplate(QUIZ_GENERATOR_SYSTEM_PROMPT);
const quizGenTemplate = PromptTemplate.fromTemplate(QUIZ_GENERATION_PROMPT);
const examGenTemplate = PromptTemplate.fromTemplate(EXAM_GENERATION_PROMPT);
const singleQuestionTemplate = PromptTemplate.fromTemplate(SINGLE_QUESTION_PROMPT);

/**
 * Extract JSON from AI response content
 */
function extractJSON<T>(content: string): T | null {
  try {
    // Try to find JSON object in the content
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }
    return null;
  } catch {
    console.error('Failed to parse JSON from content');
    return null;
  }
}

/**
 * Validate quiz data against schema
 */
function validateQuiz(data: unknown): Quiz | null {
  try {
    return QuizSchema.parse(data);
  } catch (error) {
    console.error('Quiz validation failed:', error);
    return null;
  }
}

/**
 * Validate question data against schema
 */
function validateQuestion(data: unknown): Question | null {
  try {
    return QuestionSchema.parse(data);
  } catch (error) {
    console.error('Question validation failed:', error);
    return null;
  }
}

export const quizGeneratorAgent = {
  name: 'quizGenerator',

  /**
   * Invoke the agent for conversational quiz generation requests
   */
  async invoke(state: AgentState): Promise<{
    messages: AIMessage[];
    metadata: Record<string, unknown>;
  }> {
    const model = getModelForAgent('quizGenerator');

    const systemPrompt = await systemPromptTemplate.format({
      level: state.userProfile.level,
      courseName: state.lessonContext.courseId || 'Current Course',
      moduleName: state.lessonContext.topic || 'Current Module',
      objectives: state.lessonContext.objectives.join(', ') || 'General understanding',
      ragContext: state.ragContext || 'No specific content loaded.',
    });

    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      ...state.messages,
    ]);

    const content = response.content.toString();

    // Try to extract quiz data if the response contains JSON
    const quizData = extractJSON<Quiz>(content);
    const hasQuizData = quizData !== null;

    return {
      messages: [new AIMessage(content)],
      metadata: {
        agentType: 'quizGenerator',
        generatedQuiz: hasQuizData ? quizData : undefined,
        hasStructuredOutput: hasQuizData,
      },
    };
  },

  /**
   * Generate a complete quiz with specified parameters
   */
  async generateQuiz(options: QuizGenerationOptions): Promise<Quiz | null> {
    const model = getModelForAgent('quizGenerator');

    const {
      count,
      difficulty,
      topic,
      questionTypes = ['multiple_choice', 'code_output', 'conceptual'],
      focusAreas = [],
      timePerQuestion = 60,
      courseName = 'Course',
      moduleName = 'Module',
      objectives = [],
      ragContext = '',
    } = options;

    // Format system prompt
    const systemPrompt = await systemPromptTemplate.format({
      level: difficulty * 10, // Convert 1-10 to 1-100 scale
      courseName,
      moduleName,
      objectives: objectives.join(', ') || topic,
      ragContext: ragContext || 'No specific content loaded.',
    });

    // Format quiz generation prompt
    const quizPrompt = await quizGenTemplate.format({
      count,
      difficulty,
      topic,
      questionTypes: questionTypes.join(', '),
      focusAreas: focusAreas.length > 0 ? focusAreas.join(', ') : topic,
      timePerQuestion,
    });

    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(quizPrompt),
    ]);

    const content = response.content.toString();
    const quizData = extractJSON<Quiz>(content);

    if (!quizData) {
      console.error('Failed to extract quiz JSON from response');
      return null;
    }

    return validateQuiz(quizData);
  },

  /**
   * Generate a certification exam with specified parameters
   */
  async generateExam(options: ExamGenerationOptions): Promise<Quiz | null> {
    const model = getModelForAgent('quizGenerator');

    const {
      count,
      passingScore,
      timeLimit,
      certificationTier,
      topic,
      courseName = 'Certification',
      moduleName = 'Exam',
      objectives = [],
      ragContext = '',
    } = options;

    // Determine difficulty based on tier
    const tierDifficulty = {
      bronze: 30,
      silver: 50,
      gold: 70,
      platinum: 90,
    };

    // Format system prompt
    const systemPrompt = await systemPromptTemplate.format({
      level: tierDifficulty[certificationTier],
      courseName,
      moduleName,
      objectives: objectives.join(', ') || `${certificationTier} certification in ${topic}`,
      ragContext: ragContext || 'No specific content loaded.',
    });

    // Format exam generation prompt
    const examPrompt = await examGenTemplate.format({
      count,
      passingScore,
      timeLimit,
      certificationTier,
    });

    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(examPrompt),
    ]);

    const content = response.content.toString();
    const examData = extractJSON<Quiz>(content);

    if (!examData) {
      console.error('Failed to extract exam JSON from response');
      return null;
    }

    // Add certification tier to the exam data if not present
    const examWithTier = {
      ...examData,
      certificationTier,
    };

    return validateQuiz(examWithTier);
  },

  /**
   * Generate a single question with specified parameters
   */
  async generateQuestion(
    topic: string,
    type: QuestionType,
    difficulty: number,
    ragContext?: string
  ): Promise<Question | null> {
    const model = getModelForAgent('quizGenerator');

    const prompt = await singleQuestionTemplate.format({
      topic,
      type,
      difficulty,
      ragContext: ragContext ? `\nContext:\n${ragContext}` : '',
    });

    const response = await model.invoke([
      new SystemMessage(
        'You are a question generator for an educational platform. Generate high-quality questions in the exact JSON format specified.'
      ),
      new HumanMessage(prompt),
    ]);

    const content = response.content.toString();
    const questionData = extractJSON<Question>(content);

    if (!questionData) {
      console.error('Failed to extract question JSON from response');
      return null;
    }

    return validateQuestion(questionData);
  },

  /**
   * Generate multiple questions in batch
   */
  async generateQuestionBatch(
    topic: string,
    types: QuestionType[],
    difficulty: number,
    ragContext?: string
  ): Promise<Question[]> {
    const questions: Question[] = [];

    for (const type of types) {
      const question = await this.generateQuestion(topic, type, difficulty, ragContext);
      if (question) {
        questions.push(question);
      }
    }

    return questions;
  },
};
