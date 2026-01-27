// Stub schema - defines the expected structure for AI modules
// Will be replaced with actual Drizzle schema

export interface Course {
  id: string;
  name: string;
  description: string | null;
  modules: Module[];
}

export interface Module {
  id: string;
  courseId: string;
  name: string;
  description: string | null;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  name: string;
  contentJson: unknown;
  aiConfig: unknown;
  module?: Module & { course?: Course; courseId?: string };
}

export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface UserProfile {
  id: string;
  userId: string;
  level: number;
  learningStyle: string | null;
  skillMap: unknown;
  studyPreferences: unknown;
}

export interface AISession {
  id: string;
  userId: string;
  lessonId: string | null;
  agentType: string;
  status: string;
}

export interface AIMessage {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  metadata: unknown;
}

// Placeholder table references for Drizzle-style queries
export const courses = { id: 'id' } as const;
export const modules = { id: 'id' } as const;
export const lessons = { id: 'id' } as const;
export const users = { id: 'id' } as const;
export const userProfiles = { userId: 'userId' } as const;
export const aiSessions = { id: 'id' } as const;
export const aiMessages = { id: 'id' } as const;
