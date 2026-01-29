import { pgTable, uuid, varchar, text, boolean, jsonb, timestamp, index, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

// Notification types for the platform
export const NOTIFICATION_TYPES = [
  'achievement_unlocked',
  'streak_milestone',
  'course_completed',
  'certificate_earned',
  'lesson_reminder',
  'team_update',
  'org_announcement',
  'admin_alert',
  'system_message',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

// Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull().$type<NotificationType>(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  metadata: jsonb('metadata').$type<NotificationMetadata>(),
  actionUrl: varchar('action_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  readAt: timestamp('read_at'),
}, (table) => [
  index('notifications_user_id_idx').on(table.userId),
  index('notifications_user_unread_idx').on(table.userId, table.isRead),
  index('notifications_created_at_idx').on(table.createdAt),
]);

// Notification preferences table
export const notificationPreferences = pgTable('notification_preferences', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull().$type<NotificationType>(),
  inApp: boolean('in_app').notNull().default(true),
  email: boolean('email').notNull().default(false),
  push: boolean('push').notNull().default(false),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.type] }),
]);

// Relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id],
  }),
}));

// Metadata type for different notification types
export interface NotificationMetadata {
  // For achievement_unlocked
  achievementId?: string;
  achievementName?: string;
  xpEarned?: number;

  // For streak_milestone
  streakDays?: number;

  // For course_completed
  courseId?: string;
  courseName?: string;

  // For certificate_earned
  certificationId?: string;
  certificateTier?: 'bronze' | 'silver' | 'gold';

  // For team_update
  teamId?: string;
  teamName?: string;

  // For org_announcement
  orgId?: string;
  orgName?: string;

  // Generic
  imageUrl?: string;
  [key: string]: unknown;
}

// Type exports for use in other parts of the app
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type NewNotificationPreference = typeof notificationPreferences.$inferInsert;
