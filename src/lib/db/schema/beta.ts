import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const betaInvites = pgTable('beta_invites', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  code: text('code').unique(),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at'),
});
