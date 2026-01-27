'use client';

import { Flame } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface StreakDisplayProps {
  streak: number;
  freezesAvailable?: number;
  className?: string;
}

export function StreakDisplay({
  streak,
  freezesAvailable = 0,
  className,
}: StreakDisplayProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 rounded-full cursor-help',
              className
            )}
          >
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-semibold text-orange-500">{streak}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{streak} day streak!</p>
          {freezesAvailable > 0 && (
            <p className="text-xs text-muted-foreground">
              {freezesAvailable} freeze(s) available
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
