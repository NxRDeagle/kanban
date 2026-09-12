import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useColumnFormModel } from "../../src/components/board/column-form/useColumnFormModel";
import { submitEvent } from "../helpers/formEvent";

describe("useColumnFormModel", () => {
  it("does not submit a blank title", () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useColumnFormModel({
        mode: "create",
        onSubmit,
        onCancel: vi.fn(),
      }),
    );

    expect(result.current.submitLabel).toBe("Add column");

    act(() => {
      result.current.setTitle("  ");
    });
    act(() => {
      result.current.handleSubmit(submitEvent());
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.canSubmit).toBe(false);
  });

  it("submits a trimmed title", () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useColumnFormModel({
        mode: "edit",
        initialValues: { title: "Todo" },
        onSubmit,
        onCancel: vi.fn(),
      }),
    );

    expect(result.current.submitLabel).toBe("Save");

    act(() => {
      result.current.setTitle("  Doing  ");
    });
    act(() => {
      result.current.handleSubmit(submitEvent());
    });

    expect(onSubmit).toHaveBeenCalledWith({ title: "Doing" });
  });
});
