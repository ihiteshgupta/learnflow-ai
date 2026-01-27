'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { AITutorPanel } from '@/components/ai/ai-tutor-panel';
import { LessonCanvas } from './lesson-canvas';
import { XPDisplay } from '@/components/gamification/xp-display';
import { useLessonStore } from '@/stores/lesson-store';
import { cn } from '@/lib/utils';

interface Lesson {
  id: string;
  name: string;
  type: string;
  content: unknown;
  module: {
    name: string;
    course: {
      name: string;
    };
  };
}

interface ImmersiveLessonProps {
  lesson: Lesson;
  totalSteps: number;
  onComplete: () => void;
}

export function ImmersiveLesson({
  lesson,
  totalSteps,
  onComplete,
}: ImmersiveLessonProps) {
  const router = useRouter();
  const {
    currentStep,
    progress,
    isComplete,
    setTotalSteps,
    nextStep,
    prevStep,
    markComplete,
    incrementTime,
    reset,
  } = useLessonStore();

  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [xpGained, setXpGained] = useState(0);

  useEffect(() => {
    setTotalSteps(totalSteps);
    return () => reset();
  }, [totalSteps, setTotalSteps, reset]);

  useEffect(() => {
    const timer = setInterval(incrementTime, 1000);
    return () => clearInterval(timer);
  }, [incrementTime]);

  const handleComplete = () => {
    markComplete();
    setXpGained(50); // Base XP
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const handleClose = () => {
    if (confirm('Are you sure you want to exit? Your progress will be saved.')) {
      router.back();
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col z-50">
      {/* Header */}
      <header className="h-14 border-b flex items-center justify-between px-4 bg-background/95 backdrop-blur">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <p className="text-xs text-muted-foreground">
              {lesson.module.course.name} &gt; {lesson.module.name}
            </p>
            <h1 className="font-semibold">{lesson.name}</h1>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center mt-1">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <XPDisplay xp={xpGained} recentGain={xpGained} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPanelVisible(!isPanelVisible)}
          >
            {isPanelVisible ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area */}
        <main className="flex-1 relative">
          <LessonCanvas
            lesson={lesson}
            step={currentStep}
            onComplete={handleComplete}
          />
        </main>

        {/* AI Panel */}
        <AnimatePresence>
          {isPanelVisible && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l bg-muted/30 overflow-hidden"
            >
              <AITutorPanel lessonId={lesson.id} />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <footer className="h-16 border-t flex items-center justify-between px-6 bg-background">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                i + 1 === currentStep
                  ? 'bg-primary'
                  : i + 1 < currentStep
                  ? 'bg-primary/50'
                  : 'bg-muted-foreground/30'
              )}
            />
          ))}
        </div>

        <Button
          onClick={currentStep === totalSteps ? handleComplete : nextStep}
          disabled={isComplete}
        >
          {currentStep === totalSteps ? (
            isComplete ? (
              'Completed!'
            ) : (
              'Complete'
            )
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </footer>

      {/* Completion Overlay */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold mb-2">Lesson Complete!</h2>
              <p className="text-xl text-muted-foreground">+{xpGained} XP</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
