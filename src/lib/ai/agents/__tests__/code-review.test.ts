import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import {
  codeReviewAgent,
  type CodeReviewResult,
  type InlineReviewResult,
  type LineComment,
  type SecurityReviewResult,
  type SecurityVulnerability,
  type RefactoringResult,
  type RefactoringSuggestion,
} from '../code-review';
import type { AgentState } from '../../types';

// Mock the models module
vi.mock('../../models', () => ({
  getModelForAgent: vi.fn(),
}));

// Mock the prompts module - use real prompts via importOriginal
vi.mock('../../prompts/code-review-prompts', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  return {
    ...actual,
  };
});

import { getModelForAgent } from '../../models';

// Helper to create mock model
function createMockModel() {
  return {
    invoke: vi.fn(),
  };
}

// Helper to create mock agent state
function createMockState(overrides: Partial<AgentState> = {}): AgentState {
  return {
    messages: [new HumanMessage('Review my code please')],
    currentAgent: 'codeReview',
    lessonContext: {
      lessonId: 'lesson-1',
      topic: 'Python Functions',
      courseId: 'course-1',
      objectives: ['Write clean functions', 'Handle errors properly'],
      teachingMode: 'scaffolded',
      language: 'python',
    },
    userProfile: {
      id: 'user-1',
      level: 30,
      learningStyle: 'kinesthetic',
      struggleAreas: ['error handling'],
      interests: ['web development'],
      avgScore: 78,
    },
    ragContext: 'Python best practices for function design...',
    shouldContinue: true,
    metadata: {},
    ...overrides,
  };
}

// Helper to create a code review result
function createCodeReviewResult(overrides: Partial<CodeReviewResult> = {}): CodeReviewResult {
  return {
    overallAssessment: 'The code is well-structured with minor issues',
    positives: ['Good variable naming', 'Proper use of list comprehension'],
    improvements: ['Consider adding error handling', 'What happens with empty input?'],
    resources: ['Python error handling docs', 'PEP 8 style guide'],
    score: 75,
    ...overrides,
  };
}

// Helper to create an inline review result
function createInlineReviewResult(overrides: Partial<InlineReviewResult> = {}): InlineReviewResult {
  return {
    summary: 'Code has good structure but needs error handling',
    score: 70,
    lineComments: [
      { line: 1, type: 'praise', message: 'Good function naming' },
      { line: 5, type: 'issue', message: 'What happens if input is None?' },
      { line: 10, type: 'suggestion', message: 'Consider using a generator here' },
    ],
    conceptsToReview: ['error handling', 'generators'],
    ...overrides,
  };
}

// Helper to create a security review result
function createSecurityReviewResult(overrides: Partial<SecurityReviewResult> = {}): SecurityReviewResult {
  return {
    securityScore: 80,
    vulnerabilities: [
      {
        severity: 'high',
        type: 'SQL Injection',
        line: 12,
        description: 'User input is directly interpolated into SQL query',
        guidance: 'Look into parameterized queries',
      },
      {
        severity: 'medium',
        type: 'Input Validation',
        line: 3,
        description: 'No input validation on user-provided data',
        guidance: 'Consider adding input validation before processing',
      },
    ],
    bestPractices: ['Uses HTTPS for external calls'],
    recommendations: ['Study OWASP Top 10', 'Learn about parameterized queries'],
    ...overrides,
  };
}

// Helper to create a refactoring result
function createRefactoringResult(overrides: Partial<RefactoringResult> = {}): RefactoringResult {
  return {
    refactoringScore: 65,
    suggestions: [
      {
        type: 'extract_method',
        lines: [5, 10],
        question: 'Could lines 5-10 be extracted into a descriptive function?',
        benefit: 'Improves readability and testability',
      },
      {
        type: 'simplify',
        lines: [15],
        question: 'Can this complex conditional be simplified?',
        benefit: 'Easier to understand and maintain',
      },
    ],
    patterns: ['Strategy pattern', 'Guard clause'],
    readingList: ['Clean Code by Robert Martin', 'Refactoring by Martin Fowler'],
    ...overrides,
  };
}

describe('codeReviewAgent', () => {
  let mockModel: ReturnType<typeof createMockModel>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockModel = createMockModel();
    (getModelForAgent as Mock).mockReturnValue(mockModel);
  });

  describe('agent properties', () => {
    it('should have the correct name', () => {
      expect(codeReviewAgent.name).toBe('codeReview');
    });
  });

  describe('invoke', () => {
    it('should return code review response with correct metadata', async () => {
      const state = createMockState();
      mockModel.invoke.mockResolvedValue({
        content: 'Your function looks good overall! A few things to consider...',
      });

      const result = await codeReviewAgent.invoke(state);

      expect(getModelForAgent).toHaveBeenCalledWith('codeReview');
      expect(mockModel.invoke).toHaveBeenCalledTimes(1);
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toBeInstanceOf(AIMessage);
      expect(result.metadata.agentType).toBe('codeReview');
    });

    it('should include user level in system prompt', async () => {
      const state = createMockState({
        userProfile: {
          id: 'user-1',
          level: 60,
          learningStyle: 'visual',
          struggleAreas: [],
          interests: ['AI'],
          avgScore: 92,
        },
      });
      mockModel.invoke.mockResolvedValue({
        content: 'For your advanced level, I see some patterns...',
      });

      await codeReviewAgent.invoke(state);

      const invokeCall = mockModel.invoke.mock.calls[0][0];
      expect(invokeCall[0]).toBeInstanceOf(SystemMessage);
      expect(invokeCall[0].content).toContain('60');
    });

    it('should include RAG context in system prompt', async () => {
      const state = createMockState({
        ragContext: 'Python decorators and closures best practices',
      });
      mockModel.invoke.mockResolvedValue({
        content: 'Reviewing your decorator usage...',
      });

      await codeReviewAgent.invoke(state);

      const invokeCall = mockModel.invoke.mock.calls[0][0];
      expect(invokeCall[0].content).toContain('Python decorators and closures best practices');
    });

    it('should use fallback RAG context when ragContext is empty', async () => {
      const state = createMockState({
        ragContext: '',
      });
      mockModel.invoke.mockResolvedValue({
        content: 'Let me review your code...',
      });

      await codeReviewAgent.invoke(state);

      const invokeCall = mockModel.invoke.mock.calls[0][0];
      expect(invokeCall[0].content).toContain('No specific content loaded');
    });

    it('should use language from lesson context', async () => {
      const state = createMockState({
        lessonContext: {
          lessonId: 'lesson-2',
          topic: 'JavaScript Async',
          courseId: 'course-2',
          objectives: ['Understand promises'],
          teachingMode: 'adaptive',
          language: 'javascript',
        },
      });
      mockModel.invoke.mockResolvedValue({
        content: 'Looking at your async code...',
      });

      await codeReviewAgent.invoke(state);

      const invokeCall = mockModel.invoke.mock.calls[0][0];
      expect(invokeCall[0].content).toContain('javascript');
    });

    it('should default language to python when not specified', async () => {
      const state = createMockState({
        lessonContext: {
          lessonId: 'lesson-3',
          topic: 'Programming Basics',
          courseId: 'course-3',
          objectives: ['Learn basics'],
          teachingMode: 'scaffolded',
          // no language property
        },
      });
      mockModel.invoke.mockResolvedValue({
        content: 'Reviewing your code...',
      });

      await codeReviewAgent.invoke(state);

      const invokeCall = mockModel.invoke.mock.calls[0][0];
      expect(invokeCall[0].content).toContain('python');
    });

    it('should pass all messages from state to model', async () => {
      const state = createMockState({
        messages: [
          new HumanMessage('Here is my code'),
          new AIMessage('Let me review it'),
          new HumanMessage('What about the error handling?'),
        ],
      });
      mockModel.invoke.mockResolvedValue({
        content: 'Good question about error handling...',
      });

      await codeReviewAgent.invoke(state);

      const invokeCall = mockModel.invoke.mock.calls[0][0];
      // SystemMessage + 3 messages from state
      expect(invokeCall).toHaveLength(4);
      expect(invokeCall[0]).toBeInstanceOf(SystemMessage);
    });
  });

  describe('reviewCode', () => {
    it('should return parsed code review result', async () => {
      const review = createCodeReviewResult({ score: 85 });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(review),
      });

      const result = await codeReviewAgent.reviewCode(
        'def add(a, b):\n  return a + b',
        'python',
        'Write an add function',
        25
      );

      expect(getModelForAgent).toHaveBeenCalledWith('codeReview');
      expect(result.score).toBe(85);
      expect(result.overallAssessment).toBe('The code is well-structured with minor issues');
      expect(result.positives).toHaveLength(2);
      expect(result.improvements).toHaveLength(2);
      expect(result.resources).toHaveLength(2);
    });

    it('should return fallback when JSON extraction fails', async () => {
      mockModel.invoke.mockResolvedValue({
        content: 'Your code looks good overall, nice work!',
      });

      const result = await codeReviewAgent.reviewCode(
        'x = 5',
        'python',
        'Declare a variable',
        10
      );

      expect(result.score).toBe(50);
      expect(result.positives).toEqual([]);
      expect(result.improvements).toEqual([]);
      expect(result.resources).toEqual([]);
      // Fallback uses the raw content as overallAssessment
      expect(result.overallAssessment).toBe('Your code looks good overall, nice work!');
    });

    it('should include language and objective in prompt', async () => {
      const review = createCodeReviewResult();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(review),
      });

      await codeReviewAgent.reviewCode(
        'console.log("hello")',
        'javascript',
        'Print hello world',
        20
      );

      const invokeCall = mockModel.invoke.mock.calls[0][0];
      expect(invokeCall[0]).toBeInstanceOf(SystemMessage);
      expect(invokeCall[1]).toBeInstanceOf(HumanMessage);
      expect(invokeCall[1].content).toContain('javascript');
      expect(invokeCall[1].content).toContain('Print hello world');
    });

    it('should pass ragContext to system prompt', async () => {
      const review = createCodeReviewResult();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(review),
      });

      await codeReviewAgent.reviewCode(
        'def sort(arr): pass',
        'python',
        'Implement sorting',
        30,
        'Sorting algorithms: bubble, merge, quick sort'
      );

      const invokeCall = mockModel.invoke.mock.calls[0][0];
      expect(invokeCall[0].content).toContain('Sorting algorithms');
    });

    it('should use default ragContext when not provided', async () => {
      const review = createCodeReviewResult();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(review),
      });

      await codeReviewAgent.reviewCode(
        'x = 1',
        'python',
        'Variable assignment',
        10
      );

      const invokeCall = mockModel.invoke.mock.calls[0][0];
      expect(invokeCall[0].content).toContain('General code review');
    });

    it('should include student level in system prompt', async () => {
      const review = createCodeReviewResult();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(review),
      });

      await codeReviewAgent.reviewCode(
        'x = 1',
        'python',
        'Variable assignment',
        45
      );

      const invokeCall = mockModel.invoke.mock.calls[0][0];
      expect(invokeCall[0].content).toContain('45');
    });
  });

  describe('reviewWithInlineComments', () => {
    it('should return parsed inline review result', async () => {
      const inlineReview = createInlineReviewResult({ score: 80 });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(inlineReview),
      });

      const result = await codeReviewAgent.reviewWithInlineComments(
        'def greet(name):\n  print(f"Hello {name}")\n  return name',
        'python',
        'Create a greeting function'
      );

      expect(getModelForAgent).toHaveBeenCalledWith('codeReview');
      expect(result.score).toBe(80);
      expect(result.summary).toBe('Code has good structure but needs error handling');
      expect(result.lineComments).toHaveLength(3);
      expect(result.conceptsToReview).toHaveLength(2);
    });

    it('should parse line comments with correct types', async () => {
      const inlineReview = createInlineReviewResult({
        lineComments: [
          { line: 1, type: 'praise', message: 'Clear function name' },
          { line: 3, type: 'issue', message: 'Missing null check' },
          { line: 7, type: 'suggestion', message: 'Try a list comprehension' },
        ],
      });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(inlineReview),
      });

      const result = await codeReviewAgent.reviewWithInlineComments(
        'def process(data):\n  result = []\n  for item in data:\n    result.append(item * 2)\n  return result',
        'python',
        'Process a list of numbers'
      );

      expect(result.lineComments[0].type).toBe('praise');
      expect(result.lineComments[1].type).toBe('issue');
      expect(result.lineComments[2].type).toBe('suggestion');
      expect(result.lineComments[0].line).toBe(1);
      expect(result.lineComments[1].line).toBe(3);
      expect(result.lineComments[2].line).toBe(7);
    });

    it('should return fallback when JSON extraction fails', async () => {
      mockModel.invoke.mockResolvedValue({
        content: 'Here are some comments on your code...',
      });

      const result = await codeReviewAgent.reviewWithInlineComments(
        'x = 5',
        'python',
        'Declare a variable'
      );

      expect(result.summary).toBe('Unable to generate inline review');
      expect(result.score).toBe(50);
      expect(result.lineComments).toEqual([]);
      expect(result.conceptsToReview).toEqual([]);
    });

    it('should include language and objective in prompt', async () => {
      const inlineReview = createInlineReviewResult();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(inlineReview),
      });

      await codeReviewAgent.reviewWithInlineComments(
        'const x = 5;',
        'typescript',
        'Variable declaration with const'
      );

      const invokeCall = mockModel.invoke.mock.calls[0][0];
      expect(invokeCall[0]).toBeInstanceOf(HumanMessage);
      expect(invokeCall[0].content).toContain('typescript');
      expect(invokeCall[0].content).toContain('Variable declaration with const');
    });
  });

  describe('securityReview', () => {
    it('should return parsed security review with vulnerabilities', async () => {
      const secReview = createSecurityReviewResult({ securityScore: 60 });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(secReview),
      });

      const result = await codeReviewAgent.securityReview(
        'cursor.execute("SELECT * FROM users WHERE id = " + user_id)',
        'python'
      );

      expect(getModelForAgent).toHaveBeenCalledWith('codeReview');
      expect(result.securityScore).toBe(60);
      expect(result.vulnerabilities).toHaveLength(2);
      expect(result.vulnerabilities[0].severity).toBe('high');
      expect(result.vulnerabilities[0].type).toBe('SQL Injection');
      expect(result.bestPractices).toHaveLength(1);
      expect(result.recommendations).toHaveLength(2);
    });

    it('should detect vulnerability severity levels', async () => {
      const secReview = createSecurityReviewResult({
        vulnerabilities: [
          { severity: 'high', type: 'SQL Injection', line: 5, description: 'Direct SQL injection', guidance: 'Use parameterized queries' },
          { severity: 'medium', type: 'XSS', line: 10, description: 'Unescaped output', guidance: 'Escape user output' },
          { severity: 'low', type: 'Info Disclosure', line: 15, description: 'Debug info exposed', guidance: 'Remove debug prints' },
        ],
      });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(secReview),
      });

      const result = await codeReviewAgent.securityReview(
        'query = "SELECT * FROM users WHERE id=" + id\nprint(result)\nhtml = f"<div>{user_input}</div>"',
        'python'
      );

      expect(result.vulnerabilities).toHaveLength(3);
      const severities = result.vulnerabilities.map(v => v.severity);
      expect(severities).toContain('high');
      expect(severities).toContain('medium');
      expect(severities).toContain('low');
    });

    it('should return fallback when JSON extraction fails', async () => {
      mockModel.invoke.mockResolvedValue({
        content: 'The code has some security issues you should look into.',
      });

      const result = await codeReviewAgent.securityReview(
        'eval(user_input)',
        'python'
      );

      expect(result.securityScore).toBe(50);
      expect(result.vulnerabilities).toEqual([]);
      expect(result.bestPractices).toEqual([]);
      expect(result.recommendations).toEqual([]);
    });

    it('should include language in prompt', async () => {
      const secReview = createSecurityReviewResult();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(secReview),
      });

      await codeReviewAgent.securityReview(
        'const query = `SELECT * FROM users WHERE id=${id}`;',
        'javascript'
      );

      const invokeCall = mockModel.invoke.mock.calls[0][0];
      expect(invokeCall[0]).toBeInstanceOf(HumanMessage);
      expect(invokeCall[0].content).toContain('javascript');
    });
  });

  describe('suggestRefactoring', () => {
    it('should return parsed refactoring suggestions', async () => {
      const refResult = createRefactoringResult({ refactoringScore: 70 });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(refResult),
      });

      const result = await codeReviewAgent.suggestRefactoring(
        'def process(data):\n  result = []\n  for item in data:\n    if item > 0:\n      result.append(item * 2)\n  return result',
        'python'
      );

      expect(getModelForAgent).toHaveBeenCalledWith('codeReview');
      expect(result.refactoringScore).toBe(70);
      expect(result.suggestions).toHaveLength(2);
      expect(result.patterns).toHaveLength(2);
      expect(result.readingList).toHaveLength(2);
    });

    it('should parse suggestion types correctly', async () => {
      const refResult = createRefactoringResult({
        suggestions: [
          { type: 'extract_method', lines: [1, 5], question: 'Can this be a function?', benefit: 'Better testability' },
          { type: 'simplify', lines: [8], question: 'Can you simplify this?', benefit: 'More readable' },
          { type: 'rename', lines: [2], question: 'Is this name descriptive enough?', benefit: 'Self-documenting code' },
          { type: 'reduce_duplication', lines: [10, 20], question: 'These look similar, can they share code?', benefit: 'DRY principle' },
        ],
      });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(refResult),
      });

      const result = await codeReviewAgent.suggestRefactoring(
        'def foo():\n  x = 1\n  y = 2\n  return x + y',
        'python'
      );

      const types = result.suggestions.map(s => s.type);
      expect(types).toContain('extract_method');
      expect(types).toContain('simplify');
      expect(types).toContain('rename');
      expect(types).toContain('reduce_duplication');
    });

    it('should return fallback when JSON extraction fails', async () => {
      mockModel.invoke.mockResolvedValue({
        content: 'Your code could benefit from some refactoring.',
      });

      const result = await codeReviewAgent.suggestRefactoring(
        'x = 1',
        'python'
      );

      expect(result.refactoringScore).toBe(50);
      expect(result.suggestions).toEqual([]);
      expect(result.patterns).toEqual([]);
      expect(result.readingList).toEqual([]);
    });

    it('should include language in prompt', async () => {
      const refResult = createRefactoringResult();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(refResult),
      });

      await codeReviewAgent.suggestRefactoring(
        'function add(a, b) { return a + b; }',
        'javascript'
      );

      const invokeCall = mockModel.invoke.mock.calls[0][0];
      expect(invokeCall[0]).toBeInstanceOf(HumanMessage);
      expect(invokeCall[0].content).toContain('javascript');
    });
  });

  describe('comprehensiveReview', () => {
    let reviewCodeSpy: ReturnType<typeof vi.spyOn>;
    let inlineReviewSpy: ReturnType<typeof vi.spyOn>;
    let securityReviewSpy: ReturnType<typeof vi.spyOn>;
    let refactoringSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      reviewCodeSpy = vi.spyOn(codeReviewAgent, 'reviewCode');
      inlineReviewSpy = vi.spyOn(codeReviewAgent, 'reviewWithInlineComments');
      securityReviewSpy = vi.spyOn(codeReviewAgent, 'securityReview');
      refactoringSpy = vi.spyOn(codeReviewAgent, 'suggestRefactoring');
    });

    afterEach(() => {
      reviewCodeSpy.mockRestore();
      inlineReviewSpy.mockRestore();
      securityReviewSpy.mockRestore();
      refactoringSpy.mockRestore();
    });

    it('should run all four reviews in parallel', async () => {
      const basicReview = createCodeReviewResult({ score: 80 });
      const inlineReview = createInlineReviewResult({ score: 70 });
      const secReview = createSecurityReviewResult({ securityScore: 90 });
      const refResult = createRefactoringResult({ refactoringScore: 60 });

      reviewCodeSpy.mockResolvedValue(basicReview);
      inlineReviewSpy.mockResolvedValue(inlineReview);
      securityReviewSpy.mockResolvedValue(secReview);
      refactoringSpy.mockResolvedValue(refResult);

      const result = await codeReviewAgent.comprehensiveReview(
        'def add(a, b):\n  return a + b',
        'python',
        'Write an add function',
        30
      );

      expect(result.basic.score).toBe(80);
      expect(result.inline.score).toBe(70);
      expect(result.security.securityScore).toBe(90);
      expect(result.refactoring.refactoringScore).toBe(60);
      // All 4 sub-reviews should be called
      expect(reviewCodeSpy).toHaveBeenCalledTimes(1);
      expect(inlineReviewSpy).toHaveBeenCalledTimes(1);
      expect(securityReviewSpy).toHaveBeenCalledTimes(1);
      expect(refactoringSpy).toHaveBeenCalledTimes(1);
    });

    it('should calculate weighted overall score correctly', async () => {
      const basicReview = createCodeReviewResult({ score: 80 });
      const inlineReview = createInlineReviewResult({ score: 70 });
      const secReview = createSecurityReviewResult({ securityScore: 90 });
      const refResult = createRefactoringResult({ refactoringScore: 60 });

      reviewCodeSpy.mockResolvedValue(basicReview);
      inlineReviewSpy.mockResolvedValue(inlineReview);
      securityReviewSpy.mockResolvedValue(secReview);
      refactoringSpy.mockResolvedValue(refResult);

      const result = await codeReviewAgent.comprehensiveReview(
        'def add(a, b):\n  return a + b',
        'python',
        'Write an add function',
        30
      );

      // Weighted score: 80*0.4 + 70*0.2 + 90*0.25 + 60*0.15
      // = 32 + 14 + 22.5 + 9 = 77.5 -> Math.round(77.5) = 78
      const expectedScore = Math.round(
        80 * 0.4 + 70 * 0.2 + 90 * 0.25 + 60 * 0.15
      );
      expect(result.overallScore).toBe(expectedScore);
      expect(result.overallScore).toBe(78);
    });

    it('should calculate weighted score with different values', async () => {
      reviewCodeSpy.mockResolvedValue(createCodeReviewResult({ score: 100 }));
      inlineReviewSpy.mockResolvedValue(createInlineReviewResult({ score: 100 }));
      securityReviewSpy.mockResolvedValue(createSecurityReviewResult({ securityScore: 100 }));
      refactoringSpy.mockResolvedValue(createRefactoringResult({ refactoringScore: 100 }));

      const result = await codeReviewAgent.comprehensiveReview(
        'perfect_code()',
        'python',
        'Perfect code',
        50
      );

      // 100*0.4 + 100*0.2 + 100*0.25 + 100*0.15 = 40+20+25+15 = 100
      expect(result.overallScore).toBe(100);
    });

    it('should calculate weighted score with zero values', async () => {
      reviewCodeSpy.mockResolvedValue(createCodeReviewResult({ score: 0 }));
      inlineReviewSpy.mockResolvedValue(createInlineReviewResult({ score: 0 }));
      securityReviewSpy.mockResolvedValue(createSecurityReviewResult({ securityScore: 0 }));
      refactoringSpy.mockResolvedValue(createRefactoringResult({ refactoringScore: 0 }));

      const result = await codeReviewAgent.comprehensiveReview(
        'bad_code()',
        'python',
        'Bad code',
        10
      );

      expect(result.overallScore).toBe(0);
    });

    it('should pass ragContext to reviewCode', async () => {
      const basicReview = createCodeReviewResult();
      const inlineReview = createInlineReviewResult();
      const secReview = createSecurityReviewResult();
      const refResult = createRefactoringResult();

      reviewCodeSpy.mockResolvedValue(basicReview);
      inlineReviewSpy.mockResolvedValue(inlineReview);
      securityReviewSpy.mockResolvedValue(secReview);
      refactoringSpy.mockResolvedValue(refResult);

      await codeReviewAgent.comprehensiveReview(
        'def sort(arr): pass',
        'python',
        'Sort an array',
        25,
        'Sorting algorithms context'
      );

      // reviewCode should be called with ragContext as the 5th argument
      expect(reviewCodeSpy).toHaveBeenCalledWith(
        'def sort(arr): pass',
        'python',
        'Sort an array',
        25,
        'Sorting algorithms context'
      );
    });

    it('should return fallback values when all sub-reviews return defaults', async () => {
      // Simulate sub-reviews returning fallback defaults (as if JSON parsing failed)
      reviewCodeSpy.mockResolvedValue(createCodeReviewResult({
        overallAssessment: 'Plain text review',
        positives: [],
        improvements: [],
        resources: [],
        score: 50,
      }));
      inlineReviewSpy.mockResolvedValue(createInlineReviewResult({
        summary: 'Unable to generate inline review',
        score: 50,
        lineComments: [],
        conceptsToReview: [],
      }));
      securityReviewSpy.mockResolvedValue(createSecurityReviewResult({
        securityScore: 50,
        vulnerabilities: [],
        bestPractices: [],
        recommendations: [],
      }));
      refactoringSpy.mockResolvedValue(createRefactoringResult({
        refactoringScore: 50,
        suggestions: [],
        patterns: [],
        readingList: [],
      }));

      const result = await codeReviewAgent.comprehensiveReview(
        'x = 1',
        'python',
        'Declare a variable',
        10
      );

      // All should have fallback scores
      expect(result.basic.score).toBe(50);
      expect(result.inline.score).toBe(50);
      expect(result.security.securityScore).toBe(50);
      expect(result.refactoring.refactoringScore).toBe(50);
      // Weighted: 50*0.4 + 50*0.2 + 50*0.25 + 50*0.15 = 20+10+12.5+7.5 = 50
      expect(result.overallScore).toBe(50);
    });
  });

  describe('error handling', () => {
    it('should handle malformed JSON in reviewCode', async () => {
      mockModel.invoke.mockResolvedValue({
        content: '{ "score": 80 invalid json here',
      });

      const result = await codeReviewAgent.reviewCode(
        'x = 1',
        'python',
        'Variable',
        10
      );

      expect(result.score).toBe(50);
      expect(result.positives).toEqual([]);
    });

    it('should handle malformed JSON in reviewWithInlineComments', async () => {
      mockModel.invoke.mockResolvedValue({
        content: '{ "summary": "review", "lineComments": [ } broken',
      });

      const result = await codeReviewAgent.reviewWithInlineComments(
        'x = 1',
        'python',
        'Variable'
      );

      expect(result.summary).toBe('Unable to generate inline review');
      expect(result.lineComments).toEqual([]);
    });

    it('should handle malformed JSON in securityReview', async () => {
      mockModel.invoke.mockResolvedValue({
        content: '{ "securityScore": 80, "vulnerabilities": [ } broken json',
      });

      const result = await codeReviewAgent.securityReview(
        'eval(input())',
        'python'
      );

      expect(result.securityScore).toBe(50);
      expect(result.vulnerabilities).toEqual([]);
    });

    it('should handle malformed JSON in suggestRefactoring', async () => {
      mockModel.invoke.mockResolvedValue({
        content: '{ "refactoringScore": 70, "suggestions": [ } invalid',
      });

      const result = await codeReviewAgent.suggestRefactoring(
        'x = 1',
        'python'
      );

      expect(result.refactoringScore).toBe(50);
      expect(result.suggestions).toEqual([]);
    });

    it('should handle model invocation errors in invoke', async () => {
      mockModel.invoke.mockRejectedValue(new Error('API Error'));

      const state = createMockState();

      await expect(codeReviewAgent.invoke(state)).rejects.toThrow('API Error');
    });

    it('should handle model invocation errors in reviewCode', async () => {
      mockModel.invoke.mockRejectedValue(new Error('Network Error'));

      await expect(
        codeReviewAgent.reviewCode('x = 1', 'python', 'Variable', 10)
      ).rejects.toThrow('Network Error');
    });

    it('should handle model invocation errors in reviewWithInlineComments', async () => {
      mockModel.invoke.mockRejectedValue(new Error('Timeout'));

      await expect(
        codeReviewAgent.reviewWithInlineComments('x = 1', 'python', 'Variable')
      ).rejects.toThrow('Timeout');
    });

    it('should handle model invocation errors in securityReview', async () => {
      mockModel.invoke.mockRejectedValue(new Error('Service Unavailable'));

      await expect(
        codeReviewAgent.securityReview('x = 1', 'python')
      ).rejects.toThrow('Service Unavailable');
    });

    it('should handle model invocation errors in suggestRefactoring', async () => {
      mockModel.invoke.mockRejectedValue(new Error('Rate Limited'));

      await expect(
        codeReviewAgent.suggestRefactoring('x = 1', 'python')
      ).rejects.toThrow('Rate Limited');
    });

    it('should handle model invocation errors in comprehensiveReview', async () => {
      // If any of the parallel calls fail, Promise.all rejects
      mockModel.invoke.mockRejectedValue(new Error('Comprehensive Error'));

      await expect(
        codeReviewAgent.comprehensiveReview('x = 1', 'python', 'Variable', 10)
      ).rejects.toThrow('Comprehensive Error');
    });
  });
});
