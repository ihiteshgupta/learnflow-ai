'use client';

import { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Lightbulb, Play, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChallengeCanvasProps {
  title: string;
  description: string;
  initialCode: string;
  language: string;
  timeLimit: number; // seconds
  maxHints: number;
  hints: string[];
  onSubmit: (code: string, hintsUsed: number, timeSpent: number) => Promise<boolean>;
}

export function ChallengeCanvas({
  title,
  description,
  initialCode,
  language,
  timeLimit,
  maxHints,
  hints,
  onSubmit,
}: ChallengeCanvasProps) {
  const [code, setCode] = useState(initialCode);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isComplete || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((t) => Math.max(0, t - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isComplete, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleHint = () => {
    if (hintsUsed < maxHints) {
      setHintsUsed((h) => h + 1);
      setShowHint(true);
    }
  };

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const success = await onSubmit(code, hintsUsed, timeLimit - timeRemaining);
      if (success) {
        setIsComplete(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [code, hintsUsed, timeLimit, timeRemaining, onSubmit]);

  const timeProgress = (timeRemaining / timeLimit) * 100;
  const isLowTime = timeRemaining < 60;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between bg-muted/30">
        <div>
          <h2 className="font-semibold text-lg">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className={cn('flex items-center gap-2', isLowTime && 'text-red-500')}>
            <Clock className="h-4 w-4" />
            <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
          </div>

          <Badge variant="outline">
            Hints: {hintsUsed}/{maxHints}
          </Badge>
        </div>
      </div>

      {/* Time Progress */}
      <Progress
        value={timeProgress}
        className={cn('h-1 rounded-none', isLowTime && '[&>div]:bg-red-500')}
      />

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            automaticLayout: true,
          }}
        />
      </div>

      {/* Hint Panel */}
      {showHint && hintsUsed > 0 && (
        <div className="border-t p-4 bg-amber-500/10">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5" />
            <p className="text-sm">{hints[hintsUsed - 1]}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="border-t p-4 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleHint}
          disabled={hintsUsed >= maxHints || isComplete}
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          Get Hint (-50 XP)
        </Button>

        <div className="flex gap-2">
          <Button variant="outline">
            <Play className="h-4 w-4 mr-2" />
            Run Tests
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isComplete || timeRemaining === 0}
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  );
}
