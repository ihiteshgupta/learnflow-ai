import { AIMessage, SystemMessage, HumanMessage } from '@langchain/core/messages';
import { PromptTemplate } from '@langchain/core/prompts';
import { getModelForAgent } from '../models';
import {
  MENTOR_SYSTEM_PROMPT,
  CAREER_GUIDANCE_PROMPT,
  MOTIVATION_PROMPT,
  GOAL_SETTING_PROMPT,
} from '../prompts/mentor-prompts';
import type { AgentState } from '../types';

// Type definitions for new methods
export interface CareerGuidanceOptions {
  currentSkills: string[];
  targetRole: string;
  experienceLevel: 'student' | 'junior' | 'mid' | 'senior';
  interests: string[];
}

export interface CareerGuidanceResponse {
  roadmap: string[];
  skillGaps: string[];
  recommendations: string[];
  estimatedTimeline: string;
}

export interface MotivationContext {
  currentStreak: number;
  recentProgress: number;
  strugglingAreas: string[];
  lastActiveDate: Date;
}

export interface MotivationResponse {
  message: string;
  actionItems: string[];
  encouragement: string;
}

export interface GoalInput {
  short: string[];
  medium: string[];
  long: string[];
}

export interface GoalSettingResponse {
  refinedGoals: {
    short: string[];
    medium: string[];
    long: string[];
  };
  milestones: string[];
  checkpoints: Date[];
}

// Helper function to extract JSON from response
function extractJsonFromResponse<T>(response: string): T {
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON object found in response');
  }
  return JSON.parse(jsonMatch[0]) as T;
}

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

  async getCareerGuidance(
    options: CareerGuidanceOptions
  ): Promise<CareerGuidanceResponse> {
    try {
      const model = getModelForAgent('mentor');
      const promptTemplate = PromptTemplate.fromTemplate(CAREER_GUIDANCE_PROMPT);

      const prompt = await promptTemplate.format({
        currentSkills: options.currentSkills.join(', '),
        targetRole: options.targetRole,
        experienceLevel: options.experienceLevel,
        interests: options.interests.join(', '),
      });

      const response = await model.invoke([
        new SystemMessage(prompt),
        new HumanMessage(
          'Please provide career guidance based on my profile.'
        ),
      ]);

      const responseText = response.content.toString();
      return extractJsonFromResponse<CareerGuidanceResponse>(responseText);
    } catch (error) {
      console.error('Error in getCareerGuidance:', error);
      throw new Error(
        `Failed to generate career guidance: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  async getMotivation(context: MotivationContext): Promise<MotivationResponse> {
    try {
      const model = getModelForAgent('mentor');
      const promptTemplate = PromptTemplate.fromTemplate(MOTIVATION_PROMPT);

      const prompt = await promptTemplate.format({
        currentStreak: context.currentStreak,
        recentProgress: context.recentProgress,
        strugglingAreas: context.strugglingAreas.join(', ') || 'None specified',
        lastActiveDate: context.lastActiveDate.toISOString().split('T')[0],
      });

      const response = await model.invoke([
        new SystemMessage(prompt),
        new HumanMessage('Please provide some motivation and guidance.'),
      ]);

      const responseText = response.content.toString();
      return extractJsonFromResponse<MotivationResponse>(responseText);
    } catch (error) {
      console.error('Error in getMotivation:', error);
      throw new Error(
        `Failed to generate motivation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  async setGoals(
    userId: string,
    goals: GoalInput
  ): Promise<GoalSettingResponse> {
    try {
      const model = getModelForAgent('mentor');
      const promptTemplate = PromptTemplate.fromTemplate(GOAL_SETTING_PROMPT);

      const prompt = await promptTemplate.format({
        shortTermGoals: goals.short.join('\n- ') || 'None specified',
        mediumTermGoals: goals.medium.join('\n- ') || 'None specified',
        longTermGoals: goals.long.join('\n- ') || 'None specified',
      });

      const response = await model.invoke([
        new SystemMessage(prompt),
        new HumanMessage(
          `Please help me refine my learning goals. User ID: ${userId}`
        ),
      ]);

      const responseText = response.content.toString();
      const parsed = extractJsonFromResponse<{
        refinedGoals: { short: string[]; medium: string[]; long: string[] };
        milestones: string[];
        checkpoints: string[];
      }>(responseText);

      // Convert checkpoint strings to Date objects
      return {
        refinedGoals: parsed.refinedGoals,
        milestones: parsed.milestones,
        checkpoints: parsed.checkpoints.map((cp) => new Date(cp)),
      };
    } catch (error) {
      console.error('Error in setGoals:', error);
      throw new Error(
        `Failed to set goals: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};
