import { pgTable, uuid, varchar, text, jsonb, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  planType: varchar('plan_type', { length: 50 }).notNull().default('free'),
  settings: jsonb('settings').$type<OrgSettings>(),
  branding: jsonb('branding').$type<OrgBranding>(),
  maxSeats: integer('max_seats'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  managerId: uuid('manager_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  teams: many(teams),
  users: many(users),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [teams.orgId],
    references: [organizations.id],
  }),
  manager: one(users, {
    fields: [teams.managerId],
    references: [users.id],
  }),
  members: many(users),
}));

// Types
export interface OrgSettings {
  gamificationMode?: 'full' | 'moderate' | 'minimal' | 'off';
  requireApproval?: boolean;
  allowSelfEnroll?: boolean;
}

export interface OrgBranding {
  logo?: string;
  primaryColor?: string;
  certificateLogo?: string;
}
