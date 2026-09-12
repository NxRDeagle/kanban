import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTaskFormModel } from "../../src/components/board/task-form/useTaskFormModel";
import { submitEvent } from "../helpers/formEvent";

describe("useTaskFormModel", () => {
  it("does not submit without a title", () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useTaskFormModel({
        mode: "create",
        onSubmit,
        onCancel: vi.fn(),
      }),
    );

    expect(result.current.canSubmit).toBe(false);
    expect(result.current.submitLabel).toBe("Add task");

    act(() => {
      result.current.handleSubmit(submitEvent());
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("trims the title and keeps a non-empty description", () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useTaskFormModel({
        mode: "edit",
        onSubmit,
        onCancel: vi.fn(),
      }),
    );

    expect(result.current.submitLabel).toBe("Save");

    act(() => {
      result.current.setTitle("  Ship it  ");
      result.current.setDescription("  details  ");
    });
    act(() => {
      result.current.handleSubmit(submitEvent());
    });

    expect(onSubmit).toHaveBeenCalledWith({
      title: "Ship it",
      description: "details",
    });
  });
});
