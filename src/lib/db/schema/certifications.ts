import { pgTable, uuid, varchar, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { courses } from './content';

export const certifications = pgTable('certifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  courseId: uuid('course_id').notNull(),
  tier: varchar('tier', { length: 10 }).notNull(),
  credentialId: varchar('credential_id', { length: 50 }).notNull().unique(),
  status: varchar('status', { length: 20 }).notNull().default('active'), // pending, active, revoked, rejected
  issuedAt: timestamp('issued_at'),
  expiresAt: timestamp('expires_at'),
  projectUrl: varchar('project_url', { length: 500 }),
  projectRepo: varchar('project_repo', { length: 500 }),
  reviewedBy: uuid('reviewed_by'),
  reviewFeedback: text('review_feedback'),
  metadata: jsonb('metadata').$type<CertMetadata>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const assessments = pgTable('assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  courseId: uuid('course_id').notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  score: integer('score'),
  maxScore: integer('max_score'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  answers: jsonb('answers').$type<AssessmentAnswers>(),
  feedback: jsonb('feedback').$type<AssessmentFeedback>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const assessmentQuestions = pgTable('assessment_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').notNull(),
  questionType: varchar('question_type', { length: 50 }).notNull(),
  question: text('question').notNull(),
  options: jsonb('options').$type<string[]>(),
  correctAnswer: text('correct_answer'),
  points: integer('points').notNull().default(1),
  order: integer('order').notNull(),
});

// Relations
export const certificationsRelations = relations(certifications, ({ one }) => ({
  user: one(users, {
    fields: [certifications.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [certifications.courseId],
    references: [courses.id],
  }),
}));

export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
  user: one(users, {
    fields: [assessments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [assessments.courseId],
    references: [courses.id],
  }),
  questions: many(assessmentQuestions),
}));

export const assessmentQuestionsRelations = relations(assessmentQuestions, ({ one }) => ({
  assessment: one(assessments, {
    fields: [assessmentQuestions.assessmentId],
    references: [assessments.id],
  }),
}));

// Types
export interface CertMetadata {
  skills?: string[];
  projectDescription?: string;
  reviewerNotes?: string;
}

export interface AssessmentAnswers {
  [questionId: string]: {
    answer: string | number;
    timeSpent: number;
  };
}

export interface AssessmentFeedback {
  overall?: string;
  bySection?: Record<string, string>;
  recommendations?: string[];
}
