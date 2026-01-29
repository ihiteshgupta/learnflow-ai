'use client';

import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchButtonProps {
  onClick?: () => void;
}

export function SearchButton({ onClick }: SearchButtonProps) {
  return (
    <Button
      variant="outline"
      className="w-full justify-start text-muted-foreground md:w-72 h-10 bg-muted/50 border-transparent hover:bg-muted hover:border-border transition-all duration-200"
      onClick={onClick}
    >
      <Search className="mr-2 h-4 w-4" />
      <span>Search courses...</span>
      <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">Cmd</span>K
      </kbd>
    </Button>
  );
}
