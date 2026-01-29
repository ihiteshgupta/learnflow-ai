import { pgTable, uuid, varchar, jsonb, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }),
  role: varchar('role', { length: 50 }).notNull().default('learner'),
  orgId: uuid('org_id'),
  teamId: uuid('team_id'),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  preferences: jsonb('preferences').$type<UserPreferences>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userProfiles = pgTable('user_profiles', {
  userId: uuid('user_id').primaryKey(),
  level: integer('level').notNull().default(1),
  totalXp: integer('total_xp').notNull().default(0),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  learningStyle: varchar('learning_style', { length: 50 }),
  gamificationMode: varchar('gamification_mode', { length: 20 }).default('full'),
  studyPreferences: jsonb('study_preferences').$type<StudyPreferences>(),
  skillMap: jsonb('skill_map').$type<SkillMap>(),
  lastActiveAt: timestamp('last_active_at'),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

// Types
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  notifications?: boolean;
  emailDigest?: 'daily' | 'weekly' | 'never';
  bio?: string;
}

export interface StudyPreferences {
  preferredTimes?: string[];
  sessionDuration?: number;
  interests?: string[];
}

export interface SkillMap {
  strengths?: string[];
  weakAreas?: string[];
  completedTopics?: string[];
}
