import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import {
  projectGuideAgent,
  type ProjectMilestone,
  type ProjectSubmission,
  type EvaluationResult,
  type MilestoneReviewResponse,
  type ProjectSuggestion,
  type ProjectSuggestionResponse,
} from '../project-guide';
import type { AgentState } from '../../types';

// Mock the models module
vi.mock('../../models', () => ({
  getModelForAgent: vi.fn(),
}));

// Mock the prompts module
vi.mock('../../prompts/project-guide-prompts', () => ({
  PROJECT_GUIDE_SYSTEM_PROMPT:
    'You are a project guide for level {level}. Project: {projectName}. Milestone: {milestone}. Requirements: {requirements}. Context: {ragContext}',
  MILESTONE_CREATION_PROMPT:
    'Create milestones. Requirements: {projectRequirements}. Difficulty: {difficulty}.',
  MILESTONE_REVIEW_PROMPT:
    'Review milestone: {milestoneName}. Description: {milestoneDescription}. Criteria: {milestoneCriteria}. Notes: {submissionNotes}. Code: {codeSnippets}.',
  SUBMISSION_EVALUATION_PROMPT:
    'Evaluate submission. Project: {projectId}. GitHub: {githubUrl}. Deployed: {deployedUrl}. Description: {description}. Tech: {technologiesUsed}.',
  PROJECT_SUGGESTION_PROMPT:
    'Suggest projects. Skills: {skills}. Interests: {interests}. Difficulty: {difficulty}.',
}));

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
    messages: [new HumanMessage('Help me with my project')],
    currentAgent: 'projectGuide',
    lessonContext: {
      lessonId: 'lesson-1',
      topic: 'Portfolio Project',
      courseId: 'course-1',
      objectives: ['Build a full-stack app', 'Deploy to cloud'],
      teachingMode: 'scaffolded',
    },
    userProfile: {
      id: 'user-1',
      level: 40,
      learningStyle: 'kinesthetic',
      struggleAreas: ['deployment'],
      interests: ['web development', 'React'],
      avgScore: 82,
    },
    ragContext: 'Project development best practices...',
    shouldContinue: true,
    metadata: {
      project: {
        name: 'E-commerce App',
        milestone: 'Backend Setup',
        requirements: 'Build REST API with authentication',
      },
    },
    ...overrides,
  };
}

// Helper to create milestone
function createMilestone(overrides: Partial<ProjectMilestone> = {}): ProjectMilestone {
  return {
    id: 'milestone-1',
    name: 'Project Setup',
    description: 'Initialize project structure and dependencies',
    criteria: ['Create package.json', 'Set up directory structure', 'Install core dependencies'],
    status: 'pending',
    estimatedHours: 2,
    ...overrides,
  };
}

// Helper to create submission
function createSubmission(overrides: Partial<ProjectSubmission> = {}): ProjectSubmission {
  return {
    projectId: 'project-1',
    userId: 'user-1',
    githubUrl: 'https://github.com/user/project',
    deployedUrl: 'https://project.vercel.app',
    description: 'A full-stack e-commerce application with React and Node.js',
    technologiesUsed: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    ...overrides,
  };
}

// Helper to create evaluation result
function createEvaluationResult(
  overrides: Partial<EvaluationResult> = {}
): EvaluationResult {
  return {
    scores: {
      codeQuality: 18,
      functionality: 20,
      testing: 15,
      documentation: 10,
      deployment: 8,
    },
    totalScore: 71,
    passed: true,
    feedback: 'Good overall implementation with room for improvement in testing.',
    strengths: ['Clean code', 'Good UI/UX', 'Proper error handling'],
    improvements: ['Add more unit tests', 'Improve documentation'],
    recommendation: 'approve',
    ...overrides,
  };
}

// Helper to create milestone review response
function createMilestoneReviewResponse(
  overrides: Partial<MilestoneReviewResponse> = {}
): MilestoneReviewResponse {
  return {
    approved: true,
    feedback: 'Great work on completing this milestone!',
    improvements: ['Consider adding input validation', 'Add error logging'],
    nextSteps: ['Move on to the next milestone', 'Review the feedback'],
    ...overrides,
  };
}

// Helper to create project suggestion
function createProjectSuggestion(
  overrides: Partial<ProjectSuggestion> = {}
): ProjectSuggestion {
  return {
    title: 'Task Management App',
    description: 'Build a Trello-like task management application',
    technologies: ['React', 'Node.js', 'MongoDB', 'Socket.io'],
    estimatedHours: 40,
    learningOutcomes: ['Real-time features', 'Drag and drop', 'Authentication'],
    ...overrides,
  };
}

describe('projectGuideAgent', () => {
  let mockModel: ReturnType<typeof createMockModel>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockModel = createMockModel();
    (getModelForAgent as Mock).mockReturnValue(mockModel);
  });

  describe('agent properties', () => {
    it('should have the correct name', () => {
      expect(projectGuideAgent.name).toBe('projectGuide');
    });
  });

  describe('invoke', () => {
    it('should return project guidance response', async () => {
      const state = createMockState();
      mockModel.invoke.mockResolvedValue({
        content: "I'll help you with your E-commerce App project. Let's focus on the Backend Setup milestone.",
      });

      const result = await projectGuideAgent.invoke(state);

      expect(getModelForAgent).toHaveBeenCalledWith('projectGuide');
      expect(mockModel.invoke).toHaveBeenCalledTimes(1);
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toBeInstanceOf(AIMessage);
      expect(result.metadata.agentType).toBe('projectGuide');
    });

    it('should use project metadata in system prompt', async () => {
      const state = createMockState({
        metadata: {
          project: {
            name: 'Portfolio Website',
            milestone: 'Design Phase',
            requirements: 'Responsive design with animations',
          },
        },
      });
      mockModel.invoke.mockResolvedValue({
        content: 'Let me help you with the design phase...',
      });

      await projectGuideAgent.invoke(state);

      const invokeCall = mockModel.invoke.mock.calls[0][0];
      expect(invokeCall[0]).toBeInstanceOf(SystemMessage);
      expect(invokeCall[0].content).toContain('Portfolio Website');
      expect(invokeCall[0].content).toContain('Design Phase');
    });

    it('should handle missing project metadata', async () => {
      const state = createMockState({
        metadata: {},
      });
      mockModel.invoke.mockResolvedValue({
        content: "Let's start with your portfolio project...",
      });

      const result = await projectGuideAgent.invoke(state);

      expect(result.messages).toHaveLength(1);
      expect(result.metadata.agentType).toBe('projectGuide');
    });

    it('should include user level in system prompt', async () => {
      const state = createMockState({
        userProfile: {
          id: 'user-1',
          level: 75,
          learningStyle: 'visual',
          struggleAreas: [],
          interests: ['AI'],
          avgScore: 95,
        },
      });
      mockModel.invoke.mockResolvedValue({
        content: 'For your advanced level...',
      });

      await projectGuideAgent.invoke(state);

      const invokeCall = mockModel.invoke.mock.calls[0][0];
      expect(invokeCall[0].content).toContain('75');
    });
  });

  describe('createMilestones', () => {
    it('should create milestones for beginner difficulty', async () => {
      const milestones = [
        createMilestone({ id: 'm1', name: 'Setup', estimatedHours: 1 }),
        createMilestone({ id: 'm2', name: 'Basic Features', estimatedHours: 4 }),
        createMilestone({ id: 'm3', name: 'Testing', estimatedHours: 2 }),
      ];
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify({ milestones }),
      });

      const result = await projectGuideAgent.createMilestones(
        'Build a simple todo app',
        'beginner'
      );

      expect(getModelForAgent).toHaveBeenCalledWith('projectGuide');
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Setup');
    });

    it('should create milestones for intermediate difficulty', async () => {
      const milestones = [
        createMilestone({ id: 'm1', name: 'Architecture', estimatedHours: 3 }),
        createMilestone({ id: 'm2', name: 'Backend API', estimatedHours: 8 }),
        createMilestone({ id: 'm3', name: 'Frontend', estimatedHours: 10 }),
        createMilestone({ id: 'm4', name: 'Integration', estimatedHours: 4 }),
        createMilestone({ id: 'm5', name: 'Deployment', estimatedHours: 3 }),
      ];
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify({ milestones }),
      });

      const result = await projectGuideAgent.createMilestones(
        'Build a REST API with authentication and database',
        'intermediate'
      );

      expect(result).toHaveLength(5);
      expect(result.map((m) => m.name)).toContain('Backend API');
    });

    it('should create milestones for advanced difficulty', async () => {
      const milestones = [
        createMilestone({ id: 'm1', name: 'System Design', estimatedHours: 5 }),
        createMilestone({ id: 'm2', name: 'Microservices Setup', estimatedHours: 10 }),
        createMilestone({ id: 'm3', name: 'Event-Driven Architecture', estimatedHours: 12 }),
        createMilestone({ id: 'm4', name: 'Performance Optimization', estimatedHours: 8 }),
        createMilestone({ id: 'm5', name: 'Monitoring & Observability', estimatedHours: 6 }),
        createMilestone({ id: 'm6', name: 'Documentation', estimatedHours: 4 }),
      ];
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify({ milestones }),
      });

      const result = await projectGuideAgent.createMilestones(
        'Build a distributed system with microservices',
        'advanced'
      );

      expect(result).toHaveLength(6);
      expect(result.map((m) => m.name)).toContain('System Design');
    });

    it('should throw error when JSON extraction fails', async () => {
      mockModel.invoke.mockResolvedValue({
        content: 'Here are some milestones for your project...',
      });

      await expect(
        projectGuideAgent.createMilestones('Build an app', 'beginner')
      ).rejects.toThrow('Failed to create milestones');
    });

    it('should throw error when model invocation fails', async () => {
      mockModel.invoke.mockRejectedValue(new Error('API Error'));

      await expect(
        projectGuideAgent.createMilestones('Build an app', 'beginner')
      ).rejects.toThrow('Failed to create milestones: API Error');
    });
  });

  describe('reviewMilestone', () => {
    it('should approve completed milestone', async () => {
      const response = createMilestoneReviewResponse({
        approved: true,
        feedback: 'Excellent work! All criteria met.',
      });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(response),
      });

      const milestone = createMilestone({
        name: 'API Implementation',
        criteria: ['Create endpoints', 'Add validation', 'Write tests'],
      });

      const result = await projectGuideAgent.reviewMilestone(
        milestone,
        'Completed all API endpoints with proper validation and tests.'
      );

      expect(result.approved).toBe(true);
      expect(result.feedback).toContain('Excellent');
    });

    it('should request revision for incomplete milestone', async () => {
      const response = createMilestoneReviewResponse({
        approved: false,
        feedback: 'Good progress but some criteria are not fully met.',
        improvements: [
          'Add error handling to endpoints',
          'Include integration tests',
          'Update API documentation',
        ],
        nextSteps: [
          'Review the error handling patterns',
          'Add missing tests',
          'Resubmit for review',
        ],
      });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(response),
      });

      const milestone = createMilestone({
        name: 'API Implementation',
        criteria: ['Create endpoints', 'Add error handling', 'Write tests'],
      });

      const result = await projectGuideAgent.reviewMilestone(
        milestone,
        'Created endpoints but still working on error handling.'
      );

      expect(result.approved).toBe(false);
      expect(result.improvements.length).toBeGreaterThan(0);
    });

    it('should include code snippets in review', async () => {
      const response = createMilestoneReviewResponse();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(response),
      });

      const milestone = createMilestone();
      const codeSnippets = `
        async function getUsers() {
          return await db.query('SELECT * FROM users');
        }
      `;

      await projectGuideAgent.reviewMilestone(
        milestone,
        'Implemented user fetching',
        codeSnippets
      );

      expect(mockModel.invoke).toHaveBeenCalled();
    });

    it('should handle review without code snippets', async () => {
      const response = createMilestoneReviewResponse();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(response),
      });

      const milestone = createMilestone();

      const result = await projectGuideAgent.reviewMilestone(
        milestone,
        'Completed the milestone requirements'
      );

      expect(result).toBeDefined();
      expect(result.feedback).toBeDefined();
    });

    it('should throw error when JSON extraction fails', async () => {
      mockModel.invoke.mockResolvedValue({
        content: 'Great job on this milestone!',
      });

      const milestone = createMilestone();

      await expect(
        projectGuideAgent.reviewMilestone(milestone, 'Completed')
      ).rejects.toThrow('Failed to review milestone');
    });

    it('should throw error when model invocation fails', async () => {
      mockModel.invoke.mockRejectedValue(new Error('Service Error'));

      const milestone = createMilestone();

      await expect(
        projectGuideAgent.reviewMilestone(milestone, 'Completed')
      ).rejects.toThrow('Failed to review milestone: Service Error');
    });
  });

  describe('evaluateSubmission', () => {
    it('should evaluate passing submission', async () => {
      const evaluation = createEvaluationResult({
        scores: {
          codeQuality: 18,
          functionality: 20,
          testing: 16,
          documentation: 12,
          deployment: 10,
        },
        totalScore: 76,
        passed: true,
        recommendation: 'approve',
      });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(evaluation),
      });

      const submission = createSubmission();

      const result = await projectGuideAgent.evaluateSubmission(submission);

      expect(result.passed).toBe(true);
      expect(result.recommendation).toBe('approve');
      expect(result.totalScore).toBeGreaterThanOrEqual(70);
    });

    it('should evaluate failing submission', async () => {
      const evaluation = createEvaluationResult({
        scores: {
          codeQuality: 12,
          functionality: 15,
          testing: 8,
          documentation: 5,
          deployment: 5,
        },
        totalScore: 45,
        passed: false,
        feedback: 'Needs significant improvements in multiple areas.',
        recommendation: 'revise',
      });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(evaluation),
      });

      const submission = createSubmission();

      const result = await projectGuideAgent.evaluateSubmission(submission);

      expect(result.passed).toBe(false);
      expect(result.totalScore).toBeLessThan(70);
    });

    it('should recalculate total score from individual scores', async () => {
      const evaluation = createEvaluationResult({
        scores: {
          codeQuality: 20,
          functionality: 20,
          testing: 20,
          documentation: 15,
          deployment: 10,
        },
        totalScore: 0, // Intentionally wrong
        passed: false,
      });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(evaluation),
      });

      const submission = createSubmission();

      const result = await projectGuideAgent.evaluateSubmission(submission);

      // Total should be recalculated: 20 + 20 + 20 + 15 + 10 = 85
      expect(result.totalScore).toBe(85);
      expect(result.passed).toBe(true);
    });

    it('should evaluate submission without deployed URL', async () => {
      const evaluation = createEvaluationResult({
        scores: {
          codeQuality: 18,
          functionality: 18,
          testing: 15,
          documentation: 10,
          deployment: 0,
        },
      });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(evaluation),
      });

      const submission = createSubmission({
        deployedUrl: undefined,
      });

      const result = await projectGuideAgent.evaluateSubmission(submission);

      expect(result).toBeDefined();
      expect(result.scores.deployment).toBe(0);
    });

    it('should include strengths and improvements', async () => {
      const evaluation = createEvaluationResult({
        strengths: [
          'Well-organized code structure',
          'Comprehensive error handling',
          'Good use of TypeScript',
        ],
        improvements: [
          'Add more edge case tests',
          'Improve API documentation',
          'Optimize database queries',
        ],
      });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(evaluation),
      });

      const submission = createSubmission();

      const result = await projectGuideAgent.evaluateSubmission(submission);

      expect(result.strengths).toHaveLength(3);
      expect(result.improvements).toHaveLength(3);
    });

    it('should handle rejection recommendation', async () => {
      const evaluation = createEvaluationResult({
        scores: {
          codeQuality: 5,
          functionality: 8,
          testing: 2,
          documentation: 1,
          deployment: 0,
        },
        totalScore: 16,
        passed: false,
        recommendation: 'reject',
        feedback: 'Project does not meet minimum requirements.',
      });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(evaluation),
      });

      const submission = createSubmission();

      const result = await projectGuideAgent.evaluateSubmission(submission);

      expect(result.recommendation).toBe('reject');
      expect(result.passed).toBe(false);
    });

    it('should throw error when JSON extraction fails', async () => {
      mockModel.invoke.mockResolvedValue({
        content: 'Your project looks good overall.',
      });

      const submission = createSubmission();

      await expect(
        projectGuideAgent.evaluateSubmission(submission)
      ).rejects.toThrow('Failed to evaluate submission');
    });

    it('should throw error when model invocation fails', async () => {
      mockModel.invoke.mockRejectedValue(new Error('Timeout'));

      const submission = createSubmission();

      await expect(
        projectGuideAgent.evaluateSubmission(submission)
      ).rejects.toThrow('Failed to evaluate submission: Timeout');
    });
  });

  describe('suggestProjects', () => {
    it('should suggest projects based on skills for beginner', async () => {
      const suggestions: ProjectSuggestionResponse = {
        projects: [
          createProjectSuggestion({
            title: 'Personal Blog',
            description: 'Create a simple blog with static pages',
            technologies: ['HTML', 'CSS', 'JavaScript'],
            estimatedHours: 15,
          }),
          createProjectSuggestion({
            title: 'Weather App',
            description: 'Build a weather app using a public API',
            technologies: ['JavaScript', 'Fetch API', 'CSS'],
            estimatedHours: 10,
          }),
        ],
      };
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(suggestions),
      });

      const result = await projectGuideAgent.suggestProjects(
        ['HTML', 'CSS', 'JavaScript basics'],
        ['web development'],
        'beginner'
      );

      expect(result.projects).toHaveLength(2);
      expect(result.projects[0].estimatedHours).toBeLessThanOrEqual(20);
    });

    it('should suggest projects based on skills for intermediate', async () => {
      const suggestions: ProjectSuggestionResponse = {
        projects: [
          createProjectSuggestion({
            title: 'E-commerce Platform',
            technologies: ['React', 'Node.js', 'PostgreSQL'],
            estimatedHours: 60,
          }),
          createProjectSuggestion({
            title: 'Social Media Dashboard',
            technologies: ['React', 'Redux', 'Chart.js'],
            estimatedHours: 45,
          }),
        ],
      };
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(suggestions),
      });

      const result = await projectGuideAgent.suggestProjects(
        ['React', 'Node.js', 'PostgreSQL'],
        ['full-stack development'],
        'intermediate'
      );

      expect(result.projects).toHaveLength(2);
      expect(result.projects.map((p) => p.technologies).flat()).toContain('React');
    });

    it('should suggest projects based on skills for advanced', async () => {
      const suggestions: ProjectSuggestionResponse = {
        projects: [
          createProjectSuggestion({
            title: 'Real-time Collaboration Tool',
            technologies: ['Next.js', 'WebSocket', 'Redis', 'PostgreSQL'],
            estimatedHours: 100,
            learningOutcomes: [
              'Real-time sync',
              'Conflict resolution',
              'Scaling WebSockets',
            ],
          }),
          createProjectSuggestion({
            title: 'ML Model Deployment Platform',
            technologies: ['Python', 'FastAPI', 'Docker', 'Kubernetes'],
            estimatedHours: 80,
          }),
        ],
      };
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(suggestions),
      });

      const result = await projectGuideAgent.suggestProjects(
        ['TypeScript', 'React', 'Node.js', 'Docker', 'AWS'],
        ['distributed systems', 'machine learning'],
        'advanced'
      );

      expect(result.projects).toHaveLength(2);
      expect(result.projects[0].estimatedHours).toBeGreaterThanOrEqual(80);
    });

    it('should handle empty skills array', async () => {
      const suggestions: ProjectSuggestionResponse = {
        projects: [
          createProjectSuggestion({
            title: 'Learn to Code Portfolio',
            description: 'Start with the basics',
            technologies: ['HTML', 'CSS'],
          }),
        ],
      };
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(suggestions),
      });

      const result = await projectGuideAgent.suggestProjects(
        [],
        ['web development'],
        'beginner'
      );

      expect(result.projects).toBeDefined();
    });

    it('should handle empty interests array', async () => {
      const suggestions: ProjectSuggestionResponse = {
        projects: [createProjectSuggestion()],
      };
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(suggestions),
      });

      const result = await projectGuideAgent.suggestProjects(
        ['JavaScript'],
        [],
        'beginner'
      );

      expect(result.projects).toBeDefined();
    });

    it('should include learning outcomes in suggestions', async () => {
      const suggestions: ProjectSuggestionResponse = {
        projects: [
          createProjectSuggestion({
            learningOutcomes: [
              'RESTful API design',
              'Database modeling',
              'Authentication & Authorization',
              'Deployment to cloud',
            ],
          }),
        ],
      };
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(suggestions),
      });

      const result = await projectGuideAgent.suggestProjects(
        ['JavaScript', 'Node.js'],
        ['backend development'],
        'intermediate'
      );

      expect(result.projects[0].learningOutcomes).toHaveLength(4);
    });

    it('should throw error when JSON extraction fails', async () => {
      mockModel.invoke.mockResolvedValue({
        content: 'Here are some project ideas for you...',
      });

      await expect(
        projectGuideAgent.suggestProjects(['JavaScript'], ['web'], 'beginner')
      ).rejects.toThrow('Failed to suggest projects');
    });

    it('should throw error when model invocation fails', async () => {
      mockModel.invoke.mockRejectedValue(new Error('Rate Limited'));

      await expect(
        projectGuideAgent.suggestProjects(['JavaScript'], ['web'], 'beginner')
      ).rejects.toThrow('Failed to suggest projects: Rate Limited');
    });
  });

  describe('error handling', () => {
    it('should handle malformed JSON in createMilestones', async () => {
      mockModel.invoke.mockResolvedValue({
        content: '{ "milestones": [ { "name": invalid',
      });

      await expect(
        projectGuideAgent.createMilestones('Build app', 'beginner')
      ).rejects.toThrow('Failed to create milestones');
    });

    it('should handle malformed JSON in reviewMilestone', async () => {
      mockModel.invoke.mockResolvedValue({
        content: '{ "approved": true broken',
      });

      const milestone = createMilestone();

      await expect(
        projectGuideAgent.reviewMilestone(milestone, 'Notes')
      ).rejects.toThrow('Failed to review milestone');
    });

    it('should handle malformed JSON in evaluateSubmission', async () => {
      mockModel.invoke.mockResolvedValue({
        content: '{ "scores": { } invalid',
      });

      const submission = createSubmission();

      await expect(
        projectGuideAgent.evaluateSubmission(submission)
      ).rejects.toThrow('Failed to evaluate submission');
    });

    it('should handle malformed JSON in suggestProjects', async () => {
      mockModel.invoke.mockResolvedValue({
        content: '{ "projects": [ broken',
      });

      await expect(
        projectGuideAgent.suggestProjects(['JS'], ['web'], 'beginner')
      ).rejects.toThrow('Failed to suggest projects');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete project workflow', async () => {
      // Step 1: Create milestones
      const milestones = [
        createMilestone({ id: 'm1', name: 'Setup' }),
        createMilestone({ id: 'm2', name: 'Implementation' }),
        createMilestone({ id: 'm3', name: 'Testing' }),
      ];
      mockModel.invoke.mockResolvedValueOnce({
        content: JSON.stringify({ milestones }),
      });

      const createdMilestones = await projectGuideAgent.createMilestones(
        'Build API',
        'intermediate'
      );

      // Step 2: Review milestone
      const reviewResponse = createMilestoneReviewResponse({ approved: true });
      mockModel.invoke.mockResolvedValueOnce({
        content: JSON.stringify(reviewResponse),
      });

      const review = await projectGuideAgent.reviewMilestone(
        createdMilestones[0],
        'Completed setup'
      );

      // Step 3: Evaluate final submission
      const evaluation = createEvaluationResult({ passed: true });
      mockModel.invoke.mockResolvedValueOnce({
        content: JSON.stringify(evaluation),
      });

      const submission = createSubmission();
      const evalResult = await projectGuideAgent.evaluateSubmission(submission);

      expect(createdMilestones).toHaveLength(3);
      expect(review.approved).toBe(true);
      expect(evalResult.passed).toBe(true);
      expect(mockModel.invoke).toHaveBeenCalledTimes(3);
    });
  });
});
