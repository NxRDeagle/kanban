import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useToastStore from "../../src/store/toast/useToastStore";

function clearToasts() {
  const { toasts, dismiss } = useToastStore.getState();
  for (const toast of toasts) {
    dismiss(toast.id);
  }
}

describe("useToastStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearToasts();
  });

  afterEach(() => {
    clearToasts();
    vi.useRealTimers();
  });

  it("pushes an error toast by default", () => {
    const id = useToastStore.getState().push({ message: "Move failed" });

    expect(id).toMatch(/^toast-\d+$/);
    expect(useToastStore.getState().toasts).toEqual([
      { id, message: "Move failed", variant: "error" },
    ]);
  });

  it("dismisses a toast immediately", () => {
    const id = useToastStore.getState().push({
      message: "Saved",
      variant: "success",
      durationMs: 0,
    });

    useToastStore.getState().dismiss(id);

    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it("auto-dismisses after the given duration", () => {
    useToastStore.getState().push({
      message: "Gone soon",
      durationMs: 1000,
    });

    expect(useToastStore.getState().toasts).toHaveLength(1);
    vi.advanceTimersByTime(999);
    expect(useToastStore.getState().toasts).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it("keeps a toast when duration is zero", () => {
    useToastStore.getState().push({
      message: "Sticky",
      durationMs: 0,
    });

    vi.advanceTimersByTime(10_000);
    expect(useToastStore.getState().toasts).toHaveLength(1);
  });
});
