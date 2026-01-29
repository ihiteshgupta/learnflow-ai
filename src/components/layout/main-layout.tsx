'use client';

import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc/client';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { Skeleton } from '@/components/ui/skeleton';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { data: session } = useSession();
  const { data: profile } = trpc.gamification.getProfile.useQuery(undefined, {
    enabled: !!session?.user,
  });

  // Build user object from session
  const user = {
    name: session?.user?.name ?? 'User',
    email: session?.user?.email ?? '',
    avatarUrl: session?.user?.image ?? undefined,
  };

  // Get XP and streak from gamification profile
  const xp = profile?.totalXp ?? 0;
  const streak = profile?.currentStreak ?? 0;

  // Show loading state while session loads
  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl h-16 flex items-center px-6">
          <Skeleton className="h-9 w-32" />
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
        <div className="flex">
          <div className="w-64 border-r p-4 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
          <main className="flex-1 p-6">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-64 w-full" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} xp={xp} streak={streak} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
