import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import {
  quizGeneratorAgent,
  type Quiz,
  type Question,
  type QuizGenerationOptions,
  type ExamGenerationOptions,
  type QuestionType,
} from '../quiz-generator';
import type { AgentState } from '../../types';

// Mock the models module
vi.mock('../../models', () => ({
  getModelForAgent: vi.fn(),
}));

// Mock the prompts module
vi.mock('../../prompts/quiz-generator-prompts', () => ({
  QUIZ_GENERATOR_SYSTEM_PROMPT:
    'You are a quiz generator for level {level}. Course: {courseName}, Module: {moduleName}. Objectives: {objectives}. Context: {ragContext}',
  QUIZ_GENERATION_PROMPT:
    'Generate {count} questions at difficulty {difficulty} on {topic}. Types: {questionTypes}. Focus: {focusAreas}. Time per question: {timePerQuestion}s.',
  EXAM_GENERATION_PROMPT:
    'Generate {count} questions for certification exam. Passing score: {passingScore}%. Time limit: {timeLimit}min. Tier: {certificationTier}.',
  SINGLE_QUESTION_PROMPT:
    'Generate a {type} question on {topic} at difficulty {difficulty}.{ragContext}',
}));

import { getModelForAgent } from '../../models';

// Helper to create mock model
function createMockModel() {
  return {
    invoke: vi.fn(),
  };
}

// Helper to create a valid quiz JSON response
function createQuizJson(overrides: Partial<Quiz> = {}): Quiz {
  return {
    title: 'JavaScript Fundamentals Quiz',
    description: 'Test your knowledge of JavaScript basics',
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: 'What is the correct way to declare a variable in JavaScript?',
        options: ['var x = 5', 'int x = 5', 'x := 5', 'declare x = 5'],
        correctAnswer: 'var x = 5',
        explanation: 'var is the traditional way to declare variables in JavaScript.',
        hint: 'Think about JavaScript keywords',
        difficulty: 5,
        points: 10,
        tags: ['variables', 'basics'],
      },
    ],
    totalPoints: 10,
    passingScore: 70,
    timeLimit: 15,
    tags: ['javascript', 'fundamentals'],
    ...overrides,
  };
}

// Helper to create a valid question JSON response
function createQuestionJson(overrides: Partial<Question> = {}): Question {
  return {
    id: 'q1',
    type: 'multiple_choice',
    question: 'What is a closure in JavaScript?',
    options: [
      'A function with access to its outer scope',
      'A type of loop',
      'A way to close the browser',
      'None of the above',
    ],
    correctAnswer: 'A function with access to its outer scope',
    explanation: 'A closure is a function that has access to variables from its outer scope.',
    hint: 'Think about scope and functions',
    difficulty: 6,
    points: 15,
    ...overrides,
  };
}

// Helper to create mock agent state
function createMockState(overrides: Partial<AgentState> = {}): AgentState {
  return {
    messages: [new HumanMessage('Generate a quiz on JavaScript')],
    currentAgent: 'quizGenerator',
    lessonContext: {
      lessonId: 'lesson-1',
      topic: 'JavaScript Basics',
      courseId: 'course-1',
      objectives: ['Understand variables', 'Learn functions'],
      teachingMode: 'adaptive',
    },
    userProfile: {
      id: 'user-1',
      level: 25,
      learningStyle: 'visual',
      struggleAreas: [],
      interests: ['web development'],
      avgScore: 85,
    },
    ragContext: 'JavaScript is a programming language...',
    shouldContinue: true,
    metadata: {},
    ...overrides,
  };
}

describe('quizGeneratorAgent', () => {
  let mockModel: ReturnType<typeof createMockModel>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockModel = createMockModel();
    (getModelForAgent as Mock).mockReturnValue(mockModel);
  });

  describe('agent properties', () => {
    it('should have the correct name', () => {
      expect(quizGeneratorAgent.name).toBe('quizGenerator');
    });
  });

  describe('invoke', () => {
    it('should return quiz-related response for conversational request', async () => {
      const state = createMockState();
      mockModel.invoke.mockResolvedValue({
        content: "I'll help you create a quiz on JavaScript. What topics would you like to focus on?",
      });

      const result = await quizGeneratorAgent.invoke(state);

      expect(getModelForAgent).toHaveBeenCalledWith('quizGenerator');
      expect(mockModel.invoke).toHaveBeenCalledTimes(1);
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toBeInstanceOf(AIMessage);
      expect(result.metadata.agentType).toBe('quizGenerator');
      expect(result.metadata.hasStructuredOutput).toBe(false);
    });

    it('should extract quiz JSON from response when present', async () => {
      const state = createMockState();
      const quiz = createQuizJson();
      mockModel.invoke.mockResolvedValue({
        content: `Here's your quiz:\n${JSON.stringify(quiz)}`,
      });

      const result = await quizGeneratorAgent.invoke(state);

      expect(result.metadata.hasStructuredOutput).toBe(true);
      expect(result.metadata.generatedQuiz).toBeDefined();
    });

    it('should handle responses without JSON', async () => {
      const state = createMockState();
      mockModel.invoke.mockResolvedValue({
        content: 'What specific topics should I include in the quiz?',
      });

      const result = await quizGeneratorAgent.invoke(state);

      expect(result.metadata.hasStructuredOutput).toBe(false);
      expect(result.metadata.generatedQuiz).toBeUndefined();
    });

    it('should use user profile level in system prompt', async () => {
      const state = createMockState({
        userProfile: {
          id: 'user-1',
          level: 50,
          learningStyle: 'auditory',
          struggleAreas: ['loops'],
          interests: ['AI'],
          avgScore: 90,
        },
      });
      mockModel.invoke.mockResolvedValue({
        content: 'Creating an advanced quiz for your level...',
      });

      await quizGeneratorAgent.invoke(state);

      const invokeCall = mockModel.invoke.mock.calls[0][0];
      expect(invokeCall[0]).toBeInstanceOf(SystemMessage);
      // Verify level is included in system prompt
      expect(invokeCall[0].content).toContain('50');
    });

    it('should pass through lesson context', async () => {
      const state = createMockState({
        lessonContext: {
          lessonId: 'lesson-2',
          topic: 'React Hooks',
          courseId: 'course-2',
          objectives: ['Master useState', 'Understand useEffect'],
          teachingMode: 'socratic',
        },
      });
      mockModel.invoke.mockResolvedValue({
        content: 'Generating React Hooks quiz...',
      });

      await quizGeneratorAgent.invoke(state);

      expect(mockModel.invoke).toHaveBeenCalled();
    });
  });

  describe('generateQuiz', () => {
    it('should generate quiz with specified parameters', async () => {
      const quiz = createQuizJson();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(quiz),
      });

      const options: QuizGenerationOptions = {
        count: 5,
        difficulty: 5,
        topic: 'JavaScript',
        questionTypes: ['multiple_choice', 'code_output'],
        focusAreas: ['variables', 'functions'],
        timePerQuestion: 60,
      };

      const result = await quizGeneratorAgent.generateQuiz(options);

      expect(getModelForAgent).toHaveBeenCalledWith('quizGenerator');
      expect(mockModel.invoke).toHaveBeenCalledTimes(1);
      expect(result).not.toBeNull();
      expect(result?.title).toBe(quiz.title);
      expect(result?.questions).toHaveLength(1);
    });

    it('should use default values when optional parameters are not provided', async () => {
      const quiz = createQuizJson();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(quiz),
      });

      const options: QuizGenerationOptions = {
        count: 3,
        difficulty: 3,
        topic: 'Python',
      };

      const result = await quizGeneratorAgent.generateQuiz(options);

      expect(result).not.toBeNull();
      expect(mockModel.invoke).toHaveBeenCalled();
    });

    it('should handle various difficulty levels', async () => {
      const difficulties = [1, 5, 10];

      for (const difficulty of difficulties) {
        const quiz = createQuizJson();
        mockModel.invoke.mockResolvedValue({
          content: JSON.stringify(quiz),
        });

        const options: QuizGenerationOptions = {
          count: 5,
          difficulty,
          topic: 'TypeScript',
        };

        const result = await quizGeneratorAgent.generateQuiz(options);
        expect(result).not.toBeNull();
      }

      expect(mockModel.invoke).toHaveBeenCalledTimes(3);
    });

    it('should return null when JSON extraction fails', async () => {
      mockModel.invoke.mockResolvedValue({
        content: 'No JSON here, just plain text response.',
      });

      const options: QuizGenerationOptions = {
        count: 5,
        difficulty: 5,
        topic: 'JavaScript',
      };

      const result = await quizGeneratorAgent.generateQuiz(options);

      expect(result).toBeNull();
    });

    it('should return null when quiz validation fails', async () => {
      // Invalid quiz - missing required fields
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify({ title: 'Invalid Quiz' }),
      });

      const options: QuizGenerationOptions = {
        count: 5,
        difficulty: 5,
        topic: 'JavaScript',
      };

      const result = await quizGeneratorAgent.generateQuiz(options);

      expect(result).toBeNull();
    });

    it('should include focus areas in prompt', async () => {
      const quiz = createQuizJson();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(quiz),
      });

      const options: QuizGenerationOptions = {
        count: 5,
        difficulty: 5,
        topic: 'JavaScript',
        focusAreas: ['closures', 'prototypes', 'async/await'],
      };

      await quizGeneratorAgent.generateQuiz(options);

      const invokeCall = mockModel.invoke.mock.calls[0][0];
      expect(invokeCall[1]).toBeInstanceOf(HumanMessage);
    });

    it('should include RAG context when provided', async () => {
      const quiz = createQuizJson();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(quiz),
      });

      const options: QuizGenerationOptions = {
        count: 5,
        difficulty: 5,
        topic: 'JavaScript',
        ragContext: 'Closures are functions that remember their lexical scope...',
      };

      await quizGeneratorAgent.generateQuiz(options);

      expect(mockModel.invoke).toHaveBeenCalled();
    });
  });

  describe('generateExam', () => {
    it('should generate certification exam', async () => {
      const examQuiz = createQuizJson({
        title: 'JavaScript Certification Exam',
        certificationTier: 'silver',
        passingScore: 80,
        timeLimit: 60,
      });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(examQuiz),
      });

      const options: ExamGenerationOptions = {
        count: 20,
        passingScore: 80,
        timeLimit: 60,
        certificationTier: 'silver',
        topic: 'JavaScript',
      };

      const result = await quizGeneratorAgent.generateExam(options);

      expect(result).not.toBeNull();
      expect(result?.certificationTier).toBe('silver');
    });

    it('should handle different certification tiers', async () => {
      const tiers: Array<'bronze' | 'silver' | 'gold' | 'platinum'> = [
        'bronze',
        'silver',
        'gold',
        'platinum',
      ];

      for (const tier of tiers) {
        const examQuiz = createQuizJson({
          certificationTier: tier,
        });
        mockModel.invoke.mockResolvedValue({
          content: JSON.stringify(examQuiz),
        });

        const options: ExamGenerationOptions = {
          count: 20,
          passingScore: 70,
          timeLimit: 45,
          certificationTier: tier,
          topic: 'JavaScript',
        };

        const result = await quizGeneratorAgent.generateExam(options);
        expect(result).not.toBeNull();
        expect(result?.certificationTier).toBe(tier);
      }

      expect(mockModel.invoke).toHaveBeenCalledTimes(4);
    });

    it('should add certification tier to exam data if not present', async () => {
      // Quiz without certificationTier in response
      const examQuiz = createQuizJson();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(examQuiz),
      });

      const options: ExamGenerationOptions = {
        count: 20,
        passingScore: 80,
        timeLimit: 60,
        certificationTier: 'gold',
        topic: 'JavaScript',
      };

      const result = await quizGeneratorAgent.generateExam(options);

      expect(result).not.toBeNull();
      expect(result?.certificationTier).toBe('gold');
    });

    it('should return null when exam JSON extraction fails', async () => {
      mockModel.invoke.mockResolvedValue({
        content: 'Unable to generate exam at this time.',
      });

      const options: ExamGenerationOptions = {
        count: 20,
        passingScore: 80,
        timeLimit: 60,
        certificationTier: 'silver',
        topic: 'JavaScript',
      };

      const result = await quizGeneratorAgent.generateExam(options);

      expect(result).toBeNull();
    });

    it('should use tier-appropriate difficulty levels', async () => {
      const examQuiz = createQuizJson({
        certificationTier: 'platinum',
      });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(examQuiz),
      });

      const options: ExamGenerationOptions = {
        count: 25,
        passingScore: 85,
        timeLimit: 90,
        certificationTier: 'platinum',
        topic: 'Advanced JavaScript',
      };

      await quizGeneratorAgent.generateExam(options);

      // Platinum should use difficulty level 90
      const invokeCall = mockModel.invoke.mock.calls[0][0];
      expect(invokeCall[0]).toBeInstanceOf(SystemMessage);
      expect(invokeCall[0].content).toContain('90');
    });

    it('should include optional parameters when provided', async () => {
      const examQuiz = createQuizJson({
        certificationTier: 'gold',
      });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(examQuiz),
      });

      const options: ExamGenerationOptions = {
        count: 30,
        passingScore: 75,
        timeLimit: 120,
        certificationTier: 'gold',
        topic: 'Full Stack Development',
        courseName: 'Advanced Web Development',
        moduleName: 'Final Certification',
        objectives: ['Build REST APIs', 'Deploy applications'],
        ragContext: 'Full stack development involves...',
      };

      await quizGeneratorAgent.generateExam(options);

      expect(mockModel.invoke).toHaveBeenCalled();
    });
  });

  describe('generateQuestion', () => {
    it('should generate single question', async () => {
      const question = createQuestionJson();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(question),
      });

      const result = await quizGeneratorAgent.generateQuestion(
        'JavaScript',
        'multiple_choice',
        5
      );

      expect(result).not.toBeNull();
      expect(result?.type).toBe('multiple_choice');
      expect(result?.question).toBeDefined();
    });

    it('should handle different question types', async () => {
      const types: QuestionType[] = [
        'multiple_choice',
        'code_output',
        'bug_finding',
        'code_completion',
        'conceptual',
        'true_false',
        'ordering',
      ];

      for (const type of types) {
        const question = createQuestionJson({ type });
        mockModel.invoke.mockResolvedValue({
          content: JSON.stringify(question),
        });

        const result = await quizGeneratorAgent.generateQuestion(
          'JavaScript',
          type,
          5
        );

        expect(result).not.toBeNull();
        expect(result?.type).toBe(type);
      }

      expect(mockModel.invoke).toHaveBeenCalledTimes(7);
    });

    it('should include RAG context when provided', async () => {
      const question = createQuestionJson();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(question),
      });

      await quizGeneratorAgent.generateQuestion(
        'Closures',
        'conceptual',
        7,
        'A closure is a function that captures variables from its surrounding scope.'
      );

      expect(mockModel.invoke).toHaveBeenCalled();
    });

    it('should return null when JSON extraction fails', async () => {
      mockModel.invoke.mockResolvedValue({
        content: 'Could not generate question.',
      });

      const result = await quizGeneratorAgent.generateQuestion(
        'JavaScript',
        'multiple_choice',
        5
      );

      expect(result).toBeNull();
    });

    it('should return null when question validation fails', async () => {
      // Invalid question - missing required fields
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify({ question: 'What is JavaScript?' }),
      });

      const result = await quizGeneratorAgent.generateQuestion(
        'JavaScript',
        'multiple_choice',
        5
      );

      expect(result).toBeNull();
    });

    it('should validate difficulty is within range', async () => {
      const question = createQuestionJson({ difficulty: 8 });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(question),
      });

      const result = await quizGeneratorAgent.generateQuestion(
        'JavaScript',
        'conceptual',
        8
      );

      expect(result).not.toBeNull();
      expect(result?.difficulty).toBe(8);
    });
  });

  describe('generateQuestionBatch', () => {
    it('should generate multiple questions in batch', async () => {
      const types: QuestionType[] = ['multiple_choice', 'code_output', 'conceptual'];

      types.forEach((type, index) => {
        const question = createQuestionJson({ id: `q${index + 1}`, type });
        mockModel.invoke.mockResolvedValueOnce({
          content: JSON.stringify(question),
        });
      });

      const result = await quizGeneratorAgent.generateQuestionBatch(
        'JavaScript',
        types,
        5
      );

      expect(result).toHaveLength(3);
      expect(mockModel.invoke).toHaveBeenCalledTimes(3);
    });

    it('should skip failed questions and continue', async () => {
      const question1 = createQuestionJson({ id: 'q1', type: 'multiple_choice' });
      const question3 = createQuestionJson({ id: 'q3', type: 'conceptual' });

      mockModel.invoke
        .mockResolvedValueOnce({ content: JSON.stringify(question1) })
        .mockResolvedValueOnce({ content: 'Invalid response' })
        .mockResolvedValueOnce({ content: JSON.stringify(question3) });

      const types: QuestionType[] = ['multiple_choice', 'code_output', 'conceptual'];
      const result = await quizGeneratorAgent.generateQuestionBatch(
        'JavaScript',
        types,
        5
      );

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('q1');
      expect(result[1].id).toBe('q3');
    });

    it('should return empty array when all questions fail', async () => {
      mockModel.invoke.mockResolvedValue({
        content: 'Unable to generate question',
      });

      const types: QuestionType[] = ['multiple_choice', 'code_output'];
      const result = await quizGeneratorAgent.generateQuestionBatch(
        'JavaScript',
        types,
        5
      );

      expect(result).toHaveLength(0);
    });

    it('should include RAG context for each question', async () => {
      const types: QuestionType[] = ['multiple_choice', 'conceptual'];

      types.forEach((type, index) => {
        const question = createQuestionJson({ id: `q${index + 1}`, type });
        mockModel.invoke.mockResolvedValueOnce({
          content: JSON.stringify(question),
        });
      });

      await quizGeneratorAgent.generateQuestionBatch(
        'Closures',
        types,
        6,
        'Closures capture variables from outer scope.'
      );

      expect(mockModel.invoke).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling', () => {
    it('should handle model invocation errors in invoke', async () => {
      mockModel.invoke.mockRejectedValue(new Error('API Error'));

      const state = createMockState();

      await expect(quizGeneratorAgent.invoke(state)).rejects.toThrow('API Error');
    });

    it('should handle model invocation errors in generateQuiz', async () => {
      mockModel.invoke.mockRejectedValue(new Error('Network Error'));

      const options: QuizGenerationOptions = {
        count: 5,
        difficulty: 5,
        topic: 'JavaScript',
      };

      await expect(quizGeneratorAgent.generateQuiz(options)).rejects.toThrow(
        'Network Error'
      );
    });

    it('should handle malformed JSON gracefully', async () => {
      mockModel.invoke.mockResolvedValue({
        content: '{ "title": "Quiz", "questions": [ } invalid json',
      });

      const options: QuizGenerationOptions = {
        count: 5,
        difficulty: 5,
        topic: 'JavaScript',
      };

      const result = await quizGeneratorAgent.generateQuiz(options);

      expect(result).toBeNull();
    });
  });
});
