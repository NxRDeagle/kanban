export type ToastVariant = "error" | "success";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

export interface PushToastInput {
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
}

export interface ToastState {
  toasts: Toast[];
  push: (input: PushToastInput) => string;
  dismiss: (id: string) => void;
}
