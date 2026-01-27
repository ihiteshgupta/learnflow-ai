'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AchievementToastProps {
  achievement: {
    name: string;
    xpReward: number;
    description?: string;
  };
  onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  useEffect(() => {
    // Fire confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Auto-close after 5 seconds
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 rounded-xl shadow-2xl cursor-pointer"
      onClick={onClose}
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/20 rounded-full">
          <Trophy className="h-8 w-8" />
        </div>
        <div>
          <p className="text-sm font-medium opacity-90">Achievement Unlocked!</p>
          <p className="text-xl font-bold">{achievement.name}</p>
          {achievement.description && (
            <p className="text-sm opacity-75">{achievement.description}</p>
          )}
          <p className="text-sm font-semibold mt-1">+{achievement.xpReward} XP</p>
        </div>
      </div>
    </motion.div>
  );
}
