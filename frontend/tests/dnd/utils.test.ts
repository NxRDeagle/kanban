import { describe, expect, it } from "vitest";
import {
  columnDroppableId,
  columnSortableId,
  taskDndId,
} from "../../src/dnd/ids";
import { isSameDropTarget, resolveColumnTargetId } from "../../src/dnd/utils";
import { twoColumnBoard } from "../helpers";

describe("isSameDropTarget", () => {
  it("treats matching string ids as the same target", () => {
    expect(isSameDropTarget("task:1", "task:1")).toBe(true);
    expect(isSameDropTarget("task:1", "task:2")).toBe(false);
  });

  it("compares numeric UniqueIdentifiers as strings", () => {
    expect(isSameDropTarget(1, "1")).toBe(true);
    expect(isSameDropTarget(1, 2)).toBe(false);
  });
});

describe("resolveColumnTargetId", () => {
  const columns = twoColumnBoard().columns;

  it("resolves a column sortable id", () => {
    expect(resolveColumnTargetId(columnSortableId("col-b"), columns)).toBe(
      "col-b",
    );
  });

  it("resolves a column droppable id", () => {
    expect(resolveColumnTargetId(columnDroppableId("col-a"), columns)).toBe(
      "col-a",
    );
  });

  it("resolves the column that owns a task", () => {
    expect(resolveColumnTargetId(taskDndId("task-4"), columns)).toBe("col-b");
    expect(resolveColumnTargetId(taskDndId("task-2"), columns)).toBe("col-a");
  });

  it("returns null for unknown task or junk ids", () => {
    expect(resolveColumnTargetId(taskDndId("missing"), columns)).toBeNull();
    expect(resolveColumnTargetId("board:1", columns)).toBeNull();
  });
});
