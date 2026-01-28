import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import {
  mentorAgent,
  type CareerGuidanceOptions,
  type CareerGuidanceResponse,
  type MotivationContext,
  type MotivationResponse,
  type GoalInput,
  type GoalSettingResponse,
} from '../mentor';
import type { AgentState } from '../../types';

// Mock the models module
vi.mock('../../models', () => ({
  getModelForAgent: vi.fn(),
}));

// Mock the prompts module
vi.mock('../../prompts/mentor-prompts', () => ({
  MENTOR_SYSTEM_PROMPT:
    'You are a mentor for level {level} learner. Streak: {streak}. Goals: {goals}. Interests: {interests}. Context: {ragContext}',
  CAREER_GUIDANCE_PROMPT:
    'Provide career guidance. Skills: {currentSkills}. Target: {targetRole}. Experience: {experienceLevel}. Interests: {interests}.',
  MOTIVATION_PROMPT:
    'Provide motivation. Streak: {currentStreak}. Progress: {recentProgress}%. Struggling: {strugglingAreas}. Last active: {lastActiveDate}.',
  GOAL_SETTING_PROMPT:
    'Help refine goals. Short-term: {shortTermGoals}. Medium-term: {mediumTermGoals}. Long-term: {longTermGoals}.',
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
    messages: [new HumanMessage('I need some guidance')],
    currentAgent: 'mentor',
    lessonContext: {
      lessonId: 'lesson-1',
      topic: 'Career Development',
      courseId: 'course-1',
      objectives: ['Set goals', 'Plan career path'],
      teachingMode: 'adaptive',
    },
    userProfile: {
      id: 'user-1',
      level: 30,
      learningStyle: 'visual',
      struggleAreas: ['async programming'],
      interests: ['web development', 'AI'],
      avgScore: 80,
    },
    ragContext: 'Career paths in software development...',
    shouldContinue: true,
    metadata: {
      currentStreak: 7,
      goals: ['Learn React', 'Build portfolio'],
    },
    ...overrides,
  };
}

// Helper to create career guidance response
function createCareerGuidanceResponse(
  overrides: Partial<CareerGuidanceResponse> = {}
): CareerGuidanceResponse {
  return {
    roadmap: [
      'Master JavaScript fundamentals',
      'Learn React and Node.js',
      'Build 3-5 portfolio projects',
      'Apply for junior positions',
    ],
    skillGaps: ['TypeScript', 'Testing', 'CI/CD'],
    recommendations: [
      'Take a TypeScript course',
      'Contribute to open source',
      'Practice system design',
    ],
    estimatedTimeline: '6-12 months',
    ...overrides,
  };
}

// Helper to create motivation response
function createMotivationResponse(
  overrides: Partial<MotivationResponse> = {}
): MotivationResponse {
  return {
    message:
      "Great job maintaining your streak! You're making excellent progress.",
    actionItems: [
      'Complete one lesson today',
      'Review your notes from yesterday',
      'Try a coding challenge',
    ],
    encouragement:
      'Every line of code you write brings you closer to your goals!',
    ...overrides,
  };
}

// Helper to create goal setting response
function createGoalSettingResponse(
  overrides: Partial<GoalSettingResponse> = {}
): GoalSettingResponse {
  return {
    refinedGoals: {
      short: ['Complete JavaScript module by end of week'],
      medium: ['Build a full-stack project in 2 months'],
      long: ['Get hired as a junior developer within 6 months'],
    },
    milestones: [
      'Complete fundamentals',
      'Build first project',
      'Create portfolio',
      'Start applying',
    ],
    checkpoints: [
      new Date('2024-02-01'),
      new Date('2024-03-15'),
      new Date('2024-05-01'),
    ],
    ...overrides,
  };
}

describe('mentorAgent', () => {
  let mockModel: ReturnType<typeof createMockModel>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockModel = createMockModel();
    (getModelForAgent as Mock).mockReturnValue(mockModel);
  });

  describe('agent properties', () => {
    it('should have the correct name', () => {
      expect(mentorAgent.name).toBe('mentor');
    });
  });

  describe('invoke', () => {
    it('should return mentor response for general guidance', async () => {
      const state = createMockState();
      mockModel.invoke.mockResolvedValue({
        content: "I'm here to help you with your learning journey. What would you like to focus on?",
      });

      const result = await mentorAgent.invoke(state);

      expect(getModelForAgent).toHaveBeenCalledWith('mentor');
      expect(mockModel.invoke).toHaveBeenCalledTimes(1);
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toBeInstanceOf(AIMessage);
      expect(result.metadata.agentType).toBe('mentor');
    });

    it('should use user profile in system prompt', async () => {
      const state = createMockState({
        userProfile: {
          id: 'user-1',
          level: 50,
          learningStyle: 'auditory',
          struggleAreas: ['algorithms'],
          interests: ['machine learning', 'data science'],
          avgScore: 92,
        },
      });
      mockModel.invoke.mockResolvedValue({
        content: 'Based on your interests in ML...',
      });

      await mentorAgent.invoke(state);

      const invokeCall = mockModel.invoke.mock.calls[0][0];
      expect(invokeCall[0]).toBeInstanceOf(SystemMessage);
      expect(invokeCall[0].content).toContain('50');
    });

    it('should include streak and goals in system prompt', async () => {
      const state = createMockState({
        metadata: {
          currentStreak: 14,
          goals: ['Master TypeScript', 'Learn GraphQL'],
        },
      });
      mockModel.invoke.mockResolvedValue({
        content: 'Great progress on your 14-day streak!',
      });

      await mentorAgent.invoke(state);

      const invokeCall = mockModel.invoke.mock.calls[0][0];
      expect(invokeCall[0].content).toContain('14');
    });

    it('should handle missing metadata gracefully', async () => {
      const state = createMockState({
        metadata: {},
      });
      mockModel.invoke.mockResolvedValue({
        content: 'Let me help you get started...',
      });

      const result = await mentorAgent.invoke(state);

      expect(result.messages).toHaveLength(1);
      expect(result.metadata.agentType).toBe('mentor');
    });

    it('should pass through user messages', async () => {
      const state = createMockState({
        messages: [
          new HumanMessage('How can I improve my coding skills?'),
          new AIMessage('You could practice daily...'),
          new HumanMessage('What specific projects should I build?'),
        ],
      });
      mockModel.invoke.mockResolvedValue({
        content: 'I recommend building these projects...',
      });

      await mentorAgent.invoke(state);

      const invokeCall = mockModel.invoke.mock.calls[0][0];
      expect(invokeCall.length).toBe(4); // System + 3 messages
    });
  });

  describe('getCareerGuidance', () => {
    it('should provide career guidance for student experience level', async () => {
      const response = createCareerGuidanceResponse();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(response),
      });

      const options: CareerGuidanceOptions = {
        currentSkills: ['HTML', 'CSS', 'JavaScript basics'],
        targetRole: 'Frontend Developer',
        experienceLevel: 'student',
        interests: ['UI/UX', 'animations'],
      };

      const result = await mentorAgent.getCareerGuidance(options);

      expect(getModelForAgent).toHaveBeenCalledWith('mentor');
      expect(result.roadmap).toHaveLength(4);
      expect(result.skillGaps).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.estimatedTimeline).toBeDefined();
    });

    it('should provide career guidance for junior experience level', async () => {
      const response = createCareerGuidanceResponse({
        roadmap: ['Deepen React knowledge', 'Learn testing', 'Study system design'],
        estimatedTimeline: '3-6 months',
      });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(response),
      });

      const options: CareerGuidanceOptions = {
        currentSkills: ['JavaScript', 'React', 'Node.js'],
        targetRole: 'Senior Frontend Developer',
        experienceLevel: 'junior',
        interests: ['performance', 'accessibility'],
      };

      const result = await mentorAgent.getCareerGuidance(options);

      expect(result.estimatedTimeline).toBe('3-6 months');
      expect(result.roadmap).toContain('Deepen React knowledge');
    });

    it('should provide career guidance for mid-level developers', async () => {
      const response = createCareerGuidanceResponse({
        roadmap: ['Lead a project', 'Mentor juniors', 'Learn architecture patterns'],
        skillGaps: ['Leadership', 'Communication', 'Architecture'],
        estimatedTimeline: '12-18 months',
      });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(response),
      });

      const options: CareerGuidanceOptions = {
        currentSkills: ['Full stack development', 'TypeScript', 'PostgreSQL'],
        targetRole: 'Tech Lead',
        experienceLevel: 'mid',
        interests: ['leadership', 'architecture'],
      };

      const result = await mentorAgent.getCareerGuidance(options);

      expect(result.skillGaps).toContain('Leadership');
      expect(result.roadmap).toContain('Lead a project');
    });

    it('should provide career guidance for senior developers', async () => {
      const response = createCareerGuidanceResponse({
        roadmap: [
          'Build executive presence',
          'Drive technical strategy',
          'Develop business acumen',
        ],
        skillGaps: ['Executive communication', 'Budget management'],
        estimatedTimeline: '2-3 years',
      });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(response),
      });

      const options: CareerGuidanceOptions = {
        currentSkills: ['System design', 'Team leadership', 'Multiple languages'],
        targetRole: 'VP of Engineering',
        experienceLevel: 'senior',
        interests: ['strategy', 'scaling teams'],
      };

      const result = await mentorAgent.getCareerGuidance(options);

      expect(result.estimatedTimeline).toBe('2-3 years');
    });

    it('should throw error when JSON extraction fails', async () => {
      mockModel.invoke.mockResolvedValue({
        content: 'Here is some advice without JSON structure.',
      });

      const options: CareerGuidanceOptions = {
        currentSkills: ['JavaScript'],
        targetRole: 'Developer',
        experienceLevel: 'student',
        interests: ['coding'],
      };

      await expect(mentorAgent.getCareerGuidance(options)).rejects.toThrow(
        'Failed to generate career guidance'
      );
    });

    it('should throw error when model invocation fails', async () => {
      mockModel.invoke.mockRejectedValue(new Error('API Error'));

      const options: CareerGuidanceOptions = {
        currentSkills: ['JavaScript'],
        targetRole: 'Developer',
        experienceLevel: 'student',
        interests: ['coding'],
      };

      await expect(mentorAgent.getCareerGuidance(options)).rejects.toThrow(
        'Failed to generate career guidance: API Error'
      );
    });
  });

  describe('getMotivation', () => {
    it('should provide motivation for high streak users', async () => {
      const response = createMotivationResponse({
        message:
          "Amazing! You've maintained a 30-day streak! Your dedication is truly inspiring.",
        encouragement:
          "You're in the top 5% of learners. Keep this momentum going!",
      });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(response),
      });

      const context: MotivationContext = {
        currentStreak: 30,
        recentProgress: 85,
        strugglingAreas: [],
        lastActiveDate: new Date(),
      };

      const result = await mentorAgent.getMotivation(context);

      expect(result.message).toContain('30-day streak');
      expect(result.encouragement).toBeDefined();
    });

    it('should provide motivation for low streak users', async () => {
      const response = createMotivationResponse({
        message: "Welcome back! Let's rebuild your momentum together.",
        actionItems: [
          'Start with a quick 5-minute lesson',
          'Set a daily reminder',
          'Choose a small achievable goal',
        ],
        encouragement:
          'Every expert was once a beginner. The key is to never give up!',
      });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(response),
      });

      const context: MotivationContext = {
        currentStreak: 0,
        recentProgress: 20,
        strugglingAreas: ['motivation', 'time management'],
        lastActiveDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      };

      const result = await mentorAgent.getMotivation(context);

      expect(result.message).toContain('Welcome back');
      expect(result.actionItems.length).toBeGreaterThan(0);
    });

    it('should address struggling areas in motivation', async () => {
      const response = createMotivationResponse({
        message: 'I see you are working on async programming - great choice!',
        actionItems: [
          'Break down async concepts into smaller parts',
          'Practice with simple Promise examples',
          'Watch visual explanations of the event loop',
        ],
      });
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(response),
      });

      const context: MotivationContext = {
        currentStreak: 5,
        recentProgress: 50,
        strugglingAreas: ['async programming', 'callbacks'],
        lastActiveDate: new Date(),
      };

      const result = await mentorAgent.getMotivation(context);

      expect(result.actionItems.some((item) => item.includes('async'))).toBe(true);
    });

    it('should handle users with empty struggling areas', async () => {
      const response = createMotivationResponse();
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(response),
      });

      const context: MotivationContext = {
        currentStreak: 10,
        recentProgress: 70,
        strugglingAreas: [],
        lastActiveDate: new Date(),
      };

      const result = await mentorAgent.getMotivation(context);

      expect(result).toBeDefined();
      expect(result.message).toBeDefined();
    });

    it('should throw error when JSON extraction fails', async () => {
      mockModel.invoke.mockResolvedValue({
        content: 'Keep going, you are doing great!',
      });

      const context: MotivationContext = {
        currentStreak: 5,
        recentProgress: 50,
        strugglingAreas: [],
        lastActiveDate: new Date(),
      };

      await expect(mentorAgent.getMotivation(context)).rejects.toThrow(
        'Failed to generate motivation'
      );
    });

    it('should throw error when model invocation fails', async () => {
      mockModel.invoke.mockRejectedValue(new Error('Network Error'));

      const context: MotivationContext = {
        currentStreak: 5,
        recentProgress: 50,
        strugglingAreas: [],
        lastActiveDate: new Date(),
      };

      await expect(mentorAgent.getMotivation(context)).rejects.toThrow(
        'Failed to generate motivation: Network Error'
      );
    });
  });

  describe('setGoals', () => {
    it('should refine short-term goals', async () => {
      const response = {
        refinedGoals: {
          short: [
            'Complete JavaScript arrays module by Friday',
            'Build a simple todo app this weekend',
          ],
          medium: ['Finish React basics course in 1 month'],
          long: ['Get hired as junior developer in 6 months'],
        },
        milestones: ['Arrays mastery', 'First app completed', 'React fundamentals'],
        checkpoints: ['2024-02-01', '2024-02-15', '2024-03-01'],
      };
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(response),
      });

      const goals: GoalInput = {
        short: ['Learn arrays', 'Build a project'],
        medium: ['Learn React'],
        long: ['Get a job'],
      };

      const result = await mentorAgent.setGoals('user-1', goals);

      expect(result.refinedGoals.short).toHaveLength(2);
      expect(result.milestones).toBeDefined();
      expect(result.checkpoints).toHaveLength(3);
      expect(result.checkpoints[0]).toBeInstanceOf(Date);
    });

    it('should refine medium-term goals', async () => {
      const response = {
        refinedGoals: {
          short: ['Review JavaScript fundamentals'],
          medium: [
            'Build 3 portfolio projects in next 3 months',
            'Learn TypeScript by end of Q2',
            'Contribute to 2 open source projects',
          ],
          long: ['Become mid-level developer'],
        },
        milestones: ['Project 1', 'TypeScript basics', 'First PR merged'],
        checkpoints: ['2024-02-28', '2024-04-15', '2024-05-30'],
      };
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(response),
      });

      const goals: GoalInput = {
        short: ['Review basics'],
        medium: ['Build projects', 'Learn TypeScript', 'Open source'],
        long: ['Level up career'],
      };

      const result = await mentorAgent.setGoals('user-1', goals);

      expect(result.refinedGoals.medium).toHaveLength(3);
    });

    it('should refine long-term goals', async () => {
      const response = {
        refinedGoals: {
          short: ['Start learning system design'],
          medium: ['Lead a small team project'],
          long: [
            'Become a tech lead within 2 years',
            'Start a tech blog with 1000 subscribers',
            'Speak at a tech conference',
          ],
        },
        milestones: [
          'System design basics',
          'First team lead experience',
          'Blog launched',
          'First talk',
        ],
        checkpoints: ['2024-06-01', '2024-12-01', '2025-06-01', '2026-01-01'],
      };
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(response),
      });

      const goals: GoalInput = {
        short: ['System design'],
        medium: ['Lead project'],
        long: ['Tech lead', 'Tech blog', 'Conference speaker'],
      };

      const result = await mentorAgent.setGoals('user-1', goals);

      expect(result.refinedGoals.long).toHaveLength(3);
      expect(result.checkpoints).toHaveLength(4);
    });

    it('should handle goals with empty arrays', async () => {
      const response = {
        refinedGoals: {
          short: ['Set at least one short-term goal'],
          medium: ['Define medium-term objectives'],
          long: ['Think about long-term aspirations'],
        },
        milestones: ['Goal setting complete'],
        checkpoints: ['2024-02-01'],
      };
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(response),
      });

      const goals: GoalInput = {
        short: [],
        medium: [],
        long: [],
      };

      const result = await mentorAgent.setGoals('user-1', goals);

      expect(result.refinedGoals.short.length).toBeGreaterThan(0);
    });

    it('should convert checkpoint strings to Date objects', async () => {
      const response = {
        refinedGoals: {
          short: ['Goal 1'],
          medium: ['Goal 2'],
          long: ['Goal 3'],
        },
        milestones: ['Milestone 1'],
        checkpoints: ['2024-03-15T10:00:00Z', '2024-06-01T12:00:00Z'],
      };
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(response),
      });

      const goals: GoalInput = {
        short: ['Short goal'],
        medium: ['Medium goal'],
        long: ['Long goal'],
      };

      const result = await mentorAgent.setGoals('user-1', goals);

      expect(result.checkpoints[0]).toBeInstanceOf(Date);
      expect(result.checkpoints[1]).toBeInstanceOf(Date);
    });

    it('should throw error when JSON extraction fails', async () => {
      mockModel.invoke.mockResolvedValue({
        content: 'Your goals look great, keep working on them!',
      });

      const goals: GoalInput = {
        short: ['Learn JavaScript'],
        medium: ['Build projects'],
        long: ['Get hired'],
      };

      await expect(mentorAgent.setGoals('user-1', goals)).rejects.toThrow(
        'Failed to set goals'
      );
    });

    it('should throw error when model invocation fails', async () => {
      mockModel.invoke.mockRejectedValue(new Error('Service Unavailable'));

      const goals: GoalInput = {
        short: ['Learn JavaScript'],
        medium: ['Build projects'],
        long: ['Get hired'],
      };

      await expect(mentorAgent.setGoals('user-1', goals)).rejects.toThrow(
        'Failed to set goals: Service Unavailable'
      );
    });

    it('should pass userId in the prompt', async () => {
      const response = {
        refinedGoals: {
          short: ['Goal 1'],
          medium: ['Goal 2'],
          long: ['Goal 3'],
        },
        milestones: ['Milestone'],
        checkpoints: ['2024-02-01'],
      };
      mockModel.invoke.mockResolvedValue({
        content: JSON.stringify(response),
      });

      const goals: GoalInput = {
        short: ['Goal'],
        medium: [],
        long: [],
      };

      await mentorAgent.setGoals('user-123', goals);

      const invokeCall = mockModel.invoke.mock.calls[0][0];
      expect(invokeCall[1]).toBeInstanceOf(HumanMessage);
      expect(invokeCall[1].content).toContain('user-123');
    });
  });

  describe('error handling', () => {
    it('should handle malformed JSON in career guidance', async () => {
      mockModel.invoke.mockResolvedValue({
        content: '{ "roadmap": [ "step 1" invalid json',
      });

      const options: CareerGuidanceOptions = {
        currentSkills: ['JavaScript'],
        targetRole: 'Developer',
        experienceLevel: 'student',
        interests: ['coding'],
      };

      await expect(mentorAgent.getCareerGuidance(options)).rejects.toThrow(
        'Failed to generate career guidance'
      );
    });

    it('should handle malformed JSON in motivation', async () => {
      mockModel.invoke.mockResolvedValue({
        content: '{ "message": "Keep going!" invalid',
      });

      const context: MotivationContext = {
        currentStreak: 5,
        recentProgress: 50,
        strugglingAreas: [],
        lastActiveDate: new Date(),
      };

      await expect(mentorAgent.getMotivation(context)).rejects.toThrow(
        'Failed to generate motivation'
      );
    });

    it('should handle malformed JSON in goal setting', async () => {
      mockModel.invoke.mockResolvedValue({
        content: '{ "refinedGoals": { } broken',
      });

      const goals: GoalInput = {
        short: ['Goal'],
        medium: [],
        long: [],
      };

      await expect(mentorAgent.setGoals('user-1', goals)).rejects.toThrow(
        'Failed to set goals'
      );
    });
  });
});
