import { create } from 'zustand';

interface GamificationState {
  totalXP: number;
  recentGain: number;
  level: number;
  currentStreak: number;
  showAchievement: { name: string; xpReward: number } | null;

  addXP: (amount: number) => void;
  setStreak: (streak: number) => void;
  showAchievementToast: (achievement: { name: string; xpReward: number }) => void;
  hideAchievementToast: () => void;
}

export const useGamificationStore = create<GamificationState>((set) => ({
  totalXP: 0,
  recentGain: 0,
  level: 1,
  currentStreak: 0,
  showAchievement: null,

  addXP: (amount) =>
    set((state) => {
      const newXP = state.totalXP + amount;
      const newLevel = Math.floor(Math.sqrt(newXP / 50)) + 1;

      // Clear recent gain after animation
      setTimeout(() => set({ recentGain: 0 }), 2000);

      return {
        totalXP: newXP,
        recentGain: amount,
        level: Math.min(newLevel, 100),
      };
    }),

  setStreak: (streak) => set({ currentStreak: streak }),

  showAchievementToast: (achievement) => set({ showAchievement: achievement }),

  hideAchievementToast: () => set({ showAchievement: null }),
}));
