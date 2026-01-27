import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';

export type MessageRole = 'user' | 'assistant' | 'system';

export type AgentType =
  | 'orchestrator'
  | 'tutor'
  | 'assessor'
  | 'codeReview'
  | 'mentor'
  | 'projectGuide'
  | 'quizGenerator';

export type TeachingMode = 'socratic' | 'adaptive' | 'scaffolded';

export interface UserProfile {
  id: string;
  level: number;
  learningStyle: string;
  struggleAreas: string[];
  interests: string[];
  avgScore: number;
}

export interface LessonContext {
  lessonId: string;
  topic: string;
  courseId: string;
  objectives: string[];
  teachingMode: TeachingMode;
  language?: string;
}

export interface AgentState {
  messages: (HumanMessage | AIMessage | SystemMessage)[];
  currentAgent: AgentType;
  lessonContext: LessonContext;
  userProfile: UserProfile;
  ragContext: string;
  shouldContinue: boolean;
  metadata: Record<string, unknown>;
}

export interface AgentResponse {
  content: string;
  suggestedMode?: TeachingMode;
  detectedConfusion?: boolean;
  conceptsCovered?: string[];
  followUpQuestions?: string[];
}
