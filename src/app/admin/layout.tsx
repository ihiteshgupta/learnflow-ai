'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { MainLayout } from '@/components/layout';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Route,
  Award,
  Building2,
  Settings,
  ShieldAlert,
  Loader2,
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/paths', label: 'Learning Paths', icon: Route },
  { href: '/admin/certifications', label: 'Certifications', icon: Award },
  { href: '/admin/organizations', label: 'Organizations', icon: Building2 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  // Check if user is admin
  if (session?.user?.role !== 'admin') {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            You don&apos;t have permission to access the admin area.
            Please contact an administrator if you believe this is an error.
          </p>
          <Link
            href="/"
            className="text-primary hover:underline"
          >
            Go back to home
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex gap-6">
        {/* Admin Sidebar */}
        <aside className="w-64 shrink-0">
          <div className="mb-6 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold">Admin Panel</h2>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </MainLayout>
  );
}
