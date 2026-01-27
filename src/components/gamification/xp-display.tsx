'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface XPDisplayProps {
  xp: number;
  recentGain?: number;
  className?: string;
}

export function XPDisplay({ xp, recentGain = 0, className }: XPDisplayProps) {
  return (
    <div
      className={cn(
        'relative flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 rounded-full',
        className
      )}
    >
      <Zap className="h-4 w-4 text-amber-500" />
      <span className="font-semibold text-amber-500">{xp.toLocaleString()}</span>

      <AnimatePresence>
        {recentGain > 0 && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: -20 }}
            exit={{ opacity: 0 }}
            className="absolute -top-2 right-0 text-sm font-bold text-green-500"
          >
            +{recentGain}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
