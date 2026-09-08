import { create } from "zustand";
import { TOAST_DEFAULT_DURATION_MS } from "../../constants";
import type { ToastState } from "./types";

let toastSeq = 0;
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function nextId(): string {
  toastSeq += 1;
  return `toast-${toastSeq}`;
}

const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: ({
    message,
    variant = "error",
    durationMs = TOAST_DEFAULT_DURATION_MS,
  }) => {
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

export default useToastStore;
