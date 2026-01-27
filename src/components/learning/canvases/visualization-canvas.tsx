'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

interface VisualizationStep {
  id: string;
  data: unknown;
  explanation: string;
}

interface VisualizationCanvasProps {
  type: 'memory' | 'algorithm' | 'dataflow' | 'network';
  steps: VisualizationStep[];
  renderStep: (data: unknown, type: string) => React.ReactNode;
}

export function VisualizationCanvas({
  type,
  steps,
  renderStep,
}: VisualizationCanvasProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const step = steps[currentStep];

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep((s) => {
        if (s >= steps.length - 1) {
          setIsPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, speed, steps.length]);

  return (
    <div className="h-full flex flex-col">
      {/* Visualization Area */}
      <div className="flex-1 flex items-center justify-center p-8 bg-muted/20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-4xl"
          >
            {renderStep(step.data, type)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Explanation */}
      <div className="px-8 pb-4">
        <div className="bg-muted rounded-lg p-4">
          <p className="text-sm">{step.explanation}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="h-20 border-t flex items-center justify-center gap-6 px-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentStep(0)}
          disabled={currentStep === 0}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          disabled={currentStep === 0}
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button size="icon" onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentStep((s) => Math.min(steps.length - 1, s + 1))}
          disabled={currentStep === steps.length - 1}
        >
          <SkipForward className="h-4 w-4" />
        </Button>

        <div className="w-32 flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Speed</span>
          <Slider
            value={[speed]}
            onValueChange={([v]) => setSpeed(v)}
            min={0.5}
            max={2}
            step={0.25}
            className="flex-1"
          />
          <span className="text-xs w-8">{speed}x</span>
        </div>

        <div className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>
    </div>
  );
}
