'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  BookOpen,
  Route,
  Trophy,
  BarChart3,
  Award,
  Settings,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

const sidebarItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/paths', label: 'Learning Paths', icon: Route },
  { href: '/achievements', label: 'Achievements', icon: Trophy },
  { href: '/certifications', label: 'Certifications', icon: Award },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

const bottomItems = [
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help', icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden border-r bg-sidebar md:block md:w-64">
      <ScrollArea className="h-[calc(100vh-4rem)] py-6">
        <div className="px-3 py-2">
          {/* Main Navigation */}
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  className={cn(
                    'w-full justify-start h-11 px-3 relative overflow-hidden transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium sidebar-active'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 transition-colors',
                        isActive ? 'text-primary' : ''
                      )}
                    />
                    {item.label}
                    {isActive && (
                      <Sparkles className="ml-auto h-4 w-4 text-primary/60 animate-pulse" />
                    )}
                  </Link>
                </Button>
              );
            })}
          </div>

          {/* Separator */}
          <div className="my-6 mx-3 h-px bg-border" />

          {/* Pro Upgrade Card */}
          <div className="mx-1 p-4 rounded-xl gradient-brand text-white">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">Go Pro</span>
            </div>
            <p className="text-xs text-white/80 mb-3">
              Unlock AI tutoring, advanced analytics, and certificates.
            </p>
            <Button
              size="sm"
              className="w-full bg-white text-primary hover:bg-white/90 font-semibold"
            >
              Upgrade Now
            </Button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="absolute bottom-6 left-0 right-0 px-3">
          <div className="space-y-1">
            {bottomItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  className={cn(
                    'w-full justify-start h-10 px-3 transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
