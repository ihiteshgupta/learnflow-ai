'use client';

import Link from 'next/link';
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
import { Bell, Search, Settings, LogOut, User, Menu, Moon, Sun } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';

interface HeaderProps {
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  onMenuClick?: () => void;
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5 group" aria-label="Dronacharya home">
      {/* Logo Icon */}
      <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden">
        <Image
          src="/brand/logo.svg"
          alt=""
          width={40}
          height={40}
          className="w-full h-full"
          aria-hidden="true"
        />
      </div>
      {/* Logo Text */}
      <div className="hidden sm:flex flex-col" aria-hidden="true">
        <span className="font-bold text-lg sm:text-xl tracking-tight text-foreground">
          Dronacharya
        </span>
        <span className="text-[10px] font-medium text-muted-foreground -mt-0.5 tracking-widest uppercase">
          AI Guru
        </span>
      </div>
    </Link>
  );
}

export function Header({ user, onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-14 sm:h-16 items-center px-3 sm:px-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden hover:bg-accent transition-colors h-9 w-9"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        <div className="mr-2 sm:mr-4 flex">
          <Logo />
        </div>

        <div className="flex flex-1 items-center justify-between space-x-1.5 sm:space-x-2 md:justify-end">
          {/* Search Bar */}
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground md:w-72 h-9 sm:h-10 text-xs sm:text-sm bg-muted border-border hover:bg-accent"
              aria-label="Search courses, press Command K to open"
            >
              <Search className="mr-1 sm:mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Search courses...</span>
              <span className="sm:hidden">Search...</span>
              <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 md:flex" aria-hidden="true">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-accent transition-colors h-9 w-9 sm:h-10 sm:w-10"
              aria-label="Notifications, you have new notifications"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              {/* Notification dot */}
              <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 bg-destructive rounded-full animate-pulse" aria-label="New notifications available" />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 sm:h-10 sm:w-10 hover:bg-accent transition-colors"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 sm:h-5 sm:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 sm:h-5 sm:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all duration-200"
                  aria-label={`User menu for ${user.name}`}
                >
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer min-h-[44px] sm:min-h-0">
                  <User className="mr-2 h-4 w-4" aria-hidden="true" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer min-h-[44px] sm:min-h-0">
                  <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive min-h-[44px] sm:min-h-0">
                  <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
