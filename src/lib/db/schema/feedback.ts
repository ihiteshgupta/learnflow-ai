import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const feedback = pgTable('feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id'),
  type: text('type').notNull(), // 'bug' | 'feature' | 'general'
  message: text('message').notNull(),
  page: text('page'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
