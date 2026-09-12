import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useBoardFormModel } from "../../src/components/board/board-form/useBoardFormModel";
import { submitEvent } from "../helpers/formEvent";

describe("useBoardFormModel", () => {
  it("does not submit an empty or whitespace title", () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useBoardFormModel({
        mode: "create",
        onSubmit,
        onCancel: vi.fn(),
      }),
    );

    expect(result.current.canSubmit).toBe(false);
    expect(result.current.submitLabel).toBe("Create board");

    act(() => {
      result.current.setTitle("   ");
    });
    act(() => {
      result.current.handleSubmit(submitEvent());
    });

    expect(result.current.canSubmit).toBe(false);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("trims values and sends a null description when it is blank", () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useBoardFormModel({
        mode: "edit",
        initialValues: { title: "Old", description: "Notes" },
        onSubmit,
        onCancel: vi.fn(),
      }),
    );

    expect(result.current.submitLabel).toBe("Save changes");

    act(() => {
      result.current.setTitle("  New board  ");
      result.current.setDescription("   ");
    });
    act(() => {
      result.current.handleSubmit(submitEvent());
    });

    expect(onSubmit).toHaveBeenCalledWith({
      title: "New board",
      description: null,
    });
  });

  it("blocks submit while the request is in flight", () => {
    const { result } = renderHook(() =>
      useBoardFormModel({
        mode: "create",
        onSubmit: vi.fn(),
        onCancel: vi.fn(),
        isSubmitting: true,
      }),
    );

    act(() => {
      result.current.setTitle("Board");
    });

    expect(result.current.canSubmit).toBe(false);
  });
});
