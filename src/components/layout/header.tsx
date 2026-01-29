'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Settings, LogOut, User, Sparkles } from 'lucide-react';
import { XPDisplay } from '@/components/gamification/xp-display';
import { StreakDisplay } from '@/components/gamification/streak-display';
import { NotificationBell } from '@/components/notifications';
import { SearchDialog } from '@/components/search';

interface HeaderProps {
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  xp: number;
  streak: number;
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      {/* Logo Icon */}
      <div className="relative flex items-center justify-center w-9 h-9 rounded-xl gradient-brand shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow duration-300">
        <Sparkles className="w-5 h-5 text-white" />
        <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      {/* Logo Text */}
      <div className="flex flex-col">
        <span className="font-bold text-xl tracking-tight gradient-text">
          LearnFlow
        </span>
        <span className="text-[10px] font-medium text-muted-foreground -mt-1 tracking-widest uppercase">
          AI
        </span>
      </div>
    </Link>
  );
}

export function Header({ user, xp, streak }: HeaderProps) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Logo />
          </div>

          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            {/* Search Bar */}
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <Button
                variant="outline"
                onClick={() => setSearchOpen(true)}
                className="w-full justify-start text-muted-foreground md:w-72 h-10 bg-muted/50 border-transparent hover:bg-muted hover:border-border transition-all duration-200"
              >
                <Search className="mr-2 h-4 w-4" />
                <span>Search courses...</span>
                <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {/* Gamification Stats */}
              <div className="hidden sm:flex items-center gap-2">
                <XPDisplay xp={xp} />
                <StreakDisplay streak={streak} />
              </div>

              {/* Notifications */}
              <NotificationBell />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all duration-200"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback className="gradient-brand text-white font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
