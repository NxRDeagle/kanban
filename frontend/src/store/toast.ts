import { create } from "zustand";

export type ToastVariant = "error" | "success";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface PushToastInput {
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
}

interface ToastState {
  toasts: Toast[];
  push: (input: PushToastInput) => string;
  dismiss: (id: string) => void;
}

const DEFAULT_DURATION_MS = 4000;

let toastSeq = 0;
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function nextId(): string {
  toastSeq += 1;
  return `toast-${toastSeq}`;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: ({ message, variant = "error", durationMs = DEFAULT_DURATION_MS }) => {
    const id = nextId();
    set((state) => ({
      toasts: [...state.toasts, { id, message, variant }],
    }));

    if (durationMs > 0) {
      const timer = setTimeout(() => {
        get().dismiss(id);
      }, durationMs);
      timers.set(id, timer);
    }

    return id;
  },
  dismiss: (id) => {
    const timer = timers.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.delete(id);
    }
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));
