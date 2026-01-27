'use client';

import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LevelProgressProps {
  level: number;
  currentXP: number;
  requiredXP: number;
  title?: string;
  className?: string;
}

const levelTitles: Record<number, string> = {
  1: 'Novice',
  10: 'Explorer',
  25: 'Practitioner',
  50: 'Expert',
  75: 'Master',
  100: 'Grandmaster',
};

function getTitle(level: number): string {
  const thresholds = Object.keys(levelTitles)
    .map(Number)
    .sort((a, b) => b - a);

  for (const threshold of thresholds) {
    if (level >= threshold) {
      return levelTitles[threshold];
    }
  }
  return 'Novice';
}

export function LevelProgress({
  level,
  currentXP,
  requiredXP,
  title,
  className,
}: LevelProgressProps) {
  const progress = requiredXP > 0 ? (currentXP / requiredXP) * 100 : 0;
  const displayTitle = title || getTitle(level);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-bold">
            Lvl {level}
          </Badge>
          <span className="text-sm text-muted-foreground">{displayTitle}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {currentXP.toLocaleString()} / {requiredXP.toLocaleString()} XP
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
