import { pgTable, uuid, varchar, text, jsonb, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const domains = pgTable('domains', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tracks = pgTable('tracks', {
  id: uuid('id').primaryKey().defaultRandom(),
  domainId: uuid('domain_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  difficulty: varchar('difficulty', { length: 20 }).notNull().default('beginner'),
  estimatedHours: integer('estimated_hours'),
  prerequisites: jsonb('prerequisites').$type<string[]>(),
  skillsGained: jsonb('skills_gained').$type<string[]>(),
  isPublished: boolean('is_published').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  trackId: uuid('track_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  description: text('description'),
  order: integer('order').notNull().default(0),
  estimatedMinutes: integer('estimated_minutes'),
  isPublished: boolean('is_published').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const modules = pgTable('modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  order: integer('order').notNull().default(0),
  type: varchar('type', { length: 50 }).notNull().default('concept'),
  estimatedMinutes: integer('estimated_minutes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const lessons = pgTable('lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  moduleId: uuid('module_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull().default('concept'),
  order: integer('order').notNull().default(0),
  contentJson: jsonb('content_json').$type<LessonContent>(),
  aiConfig: jsonb('ai_config').$type<AIConfig>(),
  estimatedMinutes: integer('estimated_minutes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const domainsRelations = relations(domains, ({ many }) => ({
  tracks: many(tracks),
}));

export const tracksRelations = relations(tracks, ({ one, many }) => ({
  domain: one(domains, {
    fields: [tracks.domainId],
    references: [domains.id],
  }),
  courses: many(courses),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  track: one(tracks, {
    fields: [courses.trackId],
    references: [tracks.id],
  }),
  modules: many(modules),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, {
    fields: [modules.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
  module: one(modules, {
    fields: [lessons.moduleId],
    references: [modules.id],
  }),
}));

// Types
export interface LessonContent {
  type: 'concept' | 'code' | 'visualization' | 'challenge' | 'quiz';
  title?: string;
  objectives?: string[];
  steps?: LessonStep[];
  code?: {
    language: string;
    initialCode: string;
    testCases?: TestCase[];
  };
  visualization?: {
    type: string;
    data: unknown;
  };
}

export interface LessonStep {
  id: string;
  type: 'text' | 'code' | 'interactive' | 'question';
  content: string;
  options?: string[];
  correctAnswer?: string | number;
}

export interface TestCase {
  input: string;
  expected: string;
  hidden?: boolean;
}

export interface AIConfig {
  mode: 'socratic' | 'adaptive' | 'scaffolded';
  personality?: string;
  hints?: string[];
  maxHints?: number;
}
