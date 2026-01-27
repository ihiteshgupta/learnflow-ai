import { pgTable, uuid, varchar, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { lessons } from './content';

export const aiSessions = pgTable('ai_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  lessonId: uuid('lesson_id'),
  agentType: varchar('agent_type', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
  tokenCount: integer('token_count').default(0),
  metadata: jsonb('metadata').$type<SessionMetadata>(),
});

export const aiMessages = pgTable('ai_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull(),
  role: varchar('role', { length: 20 }).notNull(),
  content: text('content').notNull(),
  metadata: jsonb('metadata').$type<MessageMetadata>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const aiSessionsRelations = relations(aiSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [aiSessions.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [aiSessions.lessonId],
    references: [lessons.id],
  }),
  messages: many(aiMessages),
}));

export const aiMessagesRelations = relations(aiMessages, ({ one }) => ({
  session: one(aiSessions, {
    fields: [aiMessages.sessionId],
    references: [aiSessions.id],
  }),
}));

// Types
export interface SessionMetadata {
  teachingMode?: string;
  confusionDetected?: boolean;
  topicsCovered?: string[];
}

export interface MessageMetadata {
  tokensUsed?: number;
  latencyMs?: number;
  model?: string;
}
