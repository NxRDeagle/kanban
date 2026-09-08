import useToastStore from "../../../store/toast/useToastStore";
import { classNames } from "./classNames";
import "./ToastHost.css";

export default function ToastHost() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className={classNames.host}
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((toast) => {
        const { id, message, variant } = toast;
        return (
          <div
            key={id}
            className={`${classNames.root} ${classNames.variant(variant)}`}
            role={variant === "error" ? "alert" : "status"}
          >
            <p className={classNames.message}>{message}</p>
            <button
              type="button"
              className={classNames.dismiss}
              onClick={() => dismiss(id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
