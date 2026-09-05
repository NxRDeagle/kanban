import { useToastStore } from "../../store/toast";
import "./ToastHost.css";

export function ToastHost() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-host" aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.variant}`}
          role={toast.variant === "error" ? "alert" : "status"}
        >
          <p className="toast-message">{toast.message}</p>
          <button
            type="button"
            className="toast-dismiss"
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            X
          </button>
        </div>
      ))}
    </div>
  );
}
