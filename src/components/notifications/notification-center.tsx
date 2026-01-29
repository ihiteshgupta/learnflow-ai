'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { NotificationItem } from './notification-item';
import { Bell, Check, Settings } from 'lucide-react';
import Link from 'next/link';

interface NotificationCenterProps {
  onClose?: () => void;
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const utils = trpc.useUtils();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const { data, isLoading } = trpc.notifications.list.useQuery({
    limit: 20,
    unreadOnly: showUnreadOnly,
  });

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.getUnreadCount.invalidate();
    },
  });

  const notifications = data?.items ?? [];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Notifications</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => markAllAsReadMutation.mutate()}
          disabled={markAllAsReadMutation.isPending}
          className="h-8 text-xs"
        >
          <Check className="h-3 w-3 mr-1" />
          Mark all read
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 p-2 border-b bg-muted/50">
        <Button
          variant={showUnreadOnly ? 'outline' : 'secondary'}
          size="sm"
          className="h-7 text-xs"
          onClick={() => setShowUnreadOnly(false)}
        >
          All
        </Button>
        <Button
          variant={showUnreadOnly ? 'secondary' : 'outline'}
          size="sm"
          className="h-7 text-xs"
          onClick={() => setShowUnreadOnly(true)}
        >
          Unread
        </Button>
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-80">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onNavigate={onClose}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <Bell className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {showUnreadOnly
                ? 'No unread notifications'
                : 'No notifications yet'}
            </p>
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-2 border-t">
        <Link href="/settings" onClick={onClose}>
          <Button variant="ghost" size="sm" className="w-full h-8 text-xs">
            <Settings className="h-3 w-3 mr-1" />
            Notification Settings
          </Button>
        </Link>
      </div>
    </div>
  );
}
