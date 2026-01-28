import { useState, useCallback } from 'react';

type ToastVariant = 'default' | 'destructive';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

// Simple toast state management
let toastId = 0;
const listeners: Set<(toasts: Toast[]) => void> = new Set();
let toasts: Toast[] = [];

function addToast(toast: ToastOptions) {
  const id = String(++toastId);
  const newToast = { ...toast, id };
  toasts = [...toasts, newToast];
  listeners.forEach(listener => listener(toasts));

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    listeners.forEach(listener => listener(toasts));
  }, 3000);

  return id;
}

export function useToast() {
  const [, setRender] = useState(0);

  const subscribe = useCallback(() => {
    const forceRender = () => setRender(r => r + 1);
    listeners.add(forceRender);
    return () => listeners.delete(forceRender);
  }, []);

  // Subscribe on mount
  useState(() => {
    const unsubscribe = subscribe();
    return () => unsubscribe();
  });

  const toast = useCallback((options: ToastOptions) => {
    addToast(options);
  }, []);

  return { toast, toasts };
}
