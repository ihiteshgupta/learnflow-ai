'use client';

import { formatDistanceToNow } from 'date-fns';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils';
import {
  Trophy,
  Flame,
  BookOpen,
  Award,
  Users,
  Building2,
  Bell,
  AlertCircle,
} from 'lucide-react';
import type { Notification } from '@/lib/db/schema';
import Link from 'next/link';

const NOTIFICATION_ICONS: Record<string, typeof Trophy> = {
  achievement_unlocked: Trophy,
  streak_milestone: Flame,
  course_completed: BookOpen,
  certificate_earned: Award,
  team_update: Users,
  org_announcement: Building2,
  admin_alert: AlertCircle,
  system_message: Bell,
  lesson_reminder: BookOpen,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  achievement_unlocked: 'text-amber-500 bg-amber-500/10',
  streak_milestone: 'text-orange-500 bg-orange-500/10',
  course_completed: 'text-emerald-500 bg-emerald-500/10',
  certificate_earned: 'text-purple-500 bg-purple-500/10',
  team_update: 'text-blue-500 bg-blue-500/10',
  org_announcement: 'text-indigo-500 bg-indigo-500/10',
  admin_alert: 'text-red-500 bg-red-500/10',
  system_message: 'text-gray-500 bg-gray-500/10',
  lesson_reminder: 'text-teal-500 bg-teal-500/10',
};

interface NotificationItemProps {
  notification: Notification;
  onNavigate?: () => void;
}

export function NotificationItem({ notification, onNavigate }: NotificationItemProps) {
  const utils = trpc.useUtils();

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.getUnreadCount.invalidate();
    },
  });

  const Icon = NOTIFICATION_ICONS[notification.type] ?? Bell;
  const colorClass = NOTIFICATION_COLORS[notification.type] ?? 'text-gray-500 bg-gray-500/10';

  const handleClick = () => {
    if (!notification.isRead) {
      markAsReadMutation.mutate({ id: notification.id });
    }
    onNavigate?.();
  };

  const content = (
    <div
      className={cn(
        'flex gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors',
        !notification.isRead && 'bg-primary/5'
      )}
      onClick={handleClick}
    >
      <div className={cn('h-10 w-10 rounded-full flex items-center justify-center shrink-0', colorClass)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm', !notification.isRead && 'font-medium')}>
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );

  if (notification.actionUrl) {
    return <Link href={notification.actionUrl} onClick={handleClick}>{content}</Link>;
  }

  return content;
}
