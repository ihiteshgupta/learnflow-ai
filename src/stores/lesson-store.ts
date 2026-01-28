import { create } from 'zustand';

interface LessonState {
  currentStep: number;
  totalSteps: number;
  progress: number;
  isComplete: boolean;
  timeSpent: number;
  hintsUsed: number;

  setTotalSteps: (total: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  markComplete: () => void;
  incrementTime: () => void;
  useHint: () => void;
  reset: () => void;
}

export const useLessonStore = create<LessonState>((set, _get) => ({
  currentStep: 1,
  totalSteps: 1,
  progress: 0,
  isComplete: false,
  timeSpent: 0,
  hintsUsed: 0,

  setTotalSteps: (total) =>
    set({
      totalSteps: total,
      progress: (1 / total) * 100,
    }),

  nextStep: () =>
    set((state) => {
      const newStep = Math.min(state.currentStep + 1, state.totalSteps);
      return {
        currentStep: newStep,
        progress: (newStep / state.totalSteps) * 100,
      };
    }),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1),
    })),

  goToStep: (step) =>
    set((state) => ({
      currentStep: Math.max(1, Math.min(step, state.totalSteps)),
      progress: (step / state.totalSteps) * 100,
    })),

  markComplete: () => set({ isComplete: true, progress: 100 }),

  incrementTime: () =>
    set((state) => ({ timeSpent: state.timeSpent + 1 })),

  useHint: () =>
    set((state) => ({ hintsUsed: state.hintsUsed + 1 })),

  reset: () =>
    set({
      currentStep: 1,
      progress: 0,
      isComplete: false,
      timeSpent: 0,
      hintsUsed: 0,
    }),
}));
