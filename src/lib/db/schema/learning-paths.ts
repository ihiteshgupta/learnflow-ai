import { pgTable, uuid, varchar, text, jsonb, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { courses } from './content';
import { users } from './users';

// Learning Paths - curated sequences of courses across tracks
export const learningPaths = pgTable('learning_paths', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  shortDescription: varchar('short_description', { length: 500 }),
  difficulty: varchar('difficulty', { length: 20 }).notNull().default('beginner'),
  estimatedHours: integer('estimated_hours'),
  imageUrl: varchar('image_url', { length: 500 }),
  tags: jsonb('tags').$type<string[]>(),
  outcomes: jsonb('outcomes').$type<string[]>(), // What learners will achieve
  prerequisites: jsonb('prerequisites').$type<string[]>(),
  targetAudience: varchar('target_audience', { length: 255 }),
  isPublished: boolean('is_published').default(false),
  isFeatured: boolean('is_featured').default(false),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Junction table for courses in learning paths
export const learningPathCourses = pgTable('learning_path_courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  pathId: uuid('path_id').notNull(),
  courseId: uuid('course_id').notNull(),
  order: integer('order').notNull().default(0),
  isOptional: boolean('is_optional').default(false),
  unlockAfterCourseId: uuid('unlock_after_course_id'), // For sequential unlocking
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User enrollments in learning paths
export const learningPathEnrollments = pgTable('learning_path_enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  pathId: uuid('path_id').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('active'), // active, completed, paused
  enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  lastActivityAt: timestamp('last_activity_at'),
});

// Relations
export const learningPathsRelations = relations(learningPaths, ({ one, many }) => ({
  creator: one(users, {
    fields: [learningPaths.createdBy],
    references: [users.id],
  }),
  courses: many(learningPathCourses),
  enrollments: many(learningPathEnrollments),
}));

export const learningPathCoursesRelations = relations(learningPathCourses, ({ one }) => ({
  path: one(learningPaths, {
    fields: [learningPathCourses.pathId],
    references: [learningPaths.id],
  }),
  course: one(courses, {
    fields: [learningPathCourses.courseId],
    references: [courses.id],
  }),
  unlockAfterCourse: one(courses, {
    fields: [learningPathCourses.unlockAfterCourseId],
    references: [courses.id],
  }),
}));

export const learningPathEnrollmentsRelations = relations(learningPathEnrollments, ({ one }) => ({
  user: one(users, {
    fields: [learningPathEnrollments.userId],
    references: [users.id],
  }),
  path: one(learningPaths, {
    fields: [learningPathEnrollments.pathId],
    references: [learningPaths.id],
  }),
}));

// Types
export type LearningPathDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type EnrollmentStatus = 'active' | 'completed' | 'paused';
