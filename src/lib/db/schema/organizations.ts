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

// Organization members (many-to-many with roles)
export const organizationMembers = pgTable('organization_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  userId: uuid('user_id').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// Team members (many-to-many with roles)
export const teamMembers = pgTable('team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull(),
  userId: uuid('user_id').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  teams: many(teams),
  members: many(organizationMembers),
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
  members: many(teamMembers),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMembers.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [organizationMembers.userId],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
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

// Role types
export type OrgRole = 'owner' | 'admin' | 'manager' | 'member';
export type TeamRole = 'lead' | 'member';

// Role hierarchy (higher index = more permissions)
export const ORG_ROLE_HIERARCHY: OrgRole[] = ['member', 'manager', 'admin', 'owner'];
export const TEAM_ROLE_HIERARCHY: TeamRole[] = ['member', 'lead'];
