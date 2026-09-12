import { describe, expect, it } from "vitest";
import { columnDroppableId, taskDndId } from "../../src/dnd/ids";
import {
  applyOptimisticTaskMove,
  resolveTaskMoveInput,
  wouldTaskMoveChange,
} from "../../src/dnd/taskMove";
import { twoColumnBoard } from "../helpers";

describe("applyOptimisticTaskMove", () => {
  it("reorders a task inside its column and reindexes positions", () => {
    const board = twoColumnBoard();
    const next = applyOptimisticTaskMove(board, "task-1", {
      toColumnId: "col-a",
      toPosition: 2,
    });

    expect(next.columns[0].tasks.map((task) => task.id)).toEqual([
      "task-2",
      "task-3",
      "task-1",
    ]);
    expect(next.columns[0].tasks.map((task) => task.position)).toEqual([
      0, 1, 2,
    ]);
    expect(next.columns[1].tasks.map((task) => task.id)).toEqual(["task-4"]);
  });

  it("clamps an out-of-range position to the column bounds", () => {
    const board = twoColumnBoard();
    const tooHigh = applyOptimisticTaskMove(board, "task-1", {
      toColumnId: "col-a",
      toPosition: 99,
    });
    const tooLow = applyOptimisticTaskMove(board, "task-2", {
      toColumnId: "col-a",
      toPosition: -4,
    });

    expect(tooHigh.columns[0].tasks.map((task) => task.id)).toEqual([
      "task-2",
      "task-3",
      "task-1",
    ]);
    expect(tooLow.columns[0].tasks.map((task) => task.id)).toEqual([
      "task-2",
      "task-1",
      "task-3",
    ]);
  });

  it("moves a task to another column and updates columnId", () => {
    const board = twoColumnBoard();
    const next = applyOptimisticTaskMove(board, "task-2", {
      toColumnId: "col-b",
      toPosition: 0,
    });

    expect(next.columns[0].tasks.map((task) => task.id)).toEqual([
      "task-1",
      "task-3",
    ]);
    expect(next.columns[0].tasks.map((task) => task.position)).toEqual([0, 1]);
    expect(next.columns[1].tasks.map((task) => task.id)).toEqual([
      "task-2",
      "task-4",
    ]);
    expect(next.columns[1].tasks[0]).toMatchObject({
      id: "task-2",
      columnId: "col-b",
      position: 0,
    });
  });

  it("returns the same board when the task or destination is missing", () => {
    const board = twoColumnBoard();

    expect(
      applyOptimisticTaskMove(board, "missing", {
        toColumnId: "col-a",
        toPosition: 0,
      }),
    ).toBe(board);
    expect(
      applyOptimisticTaskMove(board, "task-1", {
        toColumnId: "col-missing",
        toPosition: 0,
      }),
    ).toBe(board);
  });
});

describe("resolveTaskMoveInput", () => {
  it("drops onto a column as the last slot, ignoring the dragged task", () => {
    const board = twoColumnBoard();

    expect(
      resolveTaskMoveInput(board, "task-4", columnDroppableId("col-a")),
    ).toEqual({ toColumnId: "col-a", toPosition: 3 });
    expect(
      resolveTaskMoveInput(board, "task-1", columnDroppableId("col-a")),
    ).toEqual({ toColumnId: "col-a", toPosition: 2 });
  });

  it("drops onto another task at that task's index", () => {
    const board = twoColumnBoard();

    expect(resolveTaskMoveInput(board, "task-1", taskDndId("task-3"))).toEqual({
      toColumnId: "col-a",
      toPosition: 1,
    });
    expect(resolveTaskMoveInput(board, "task-1", taskDndId("task-4"))).toEqual({
      toColumnId: "col-b",
      toPosition: 0,
    });
  });

  it("returns null for self, unknown over, or a missing source task", () => {
    const board = twoColumnBoard();

    expect(
      resolveTaskMoveInput(board, "task-1", taskDndId("task-1")),
    ).toBeNull();
    expect(resolveTaskMoveInput(board, "task-1", "board:1")).toBeNull();
    expect(
      resolveTaskMoveInput(board, "task-1", columnDroppableId("missing")),
    ).toBeNull();
    expect(
      resolveTaskMoveInput(board, "missing", taskDndId("task-2")),
    ).toBeNull();
  });
});

describe("wouldTaskMoveChange", () => {
  it("is false when the task already sits in that slot", () => {
    const board = twoColumnBoard();

    expect(
      wouldTaskMoveChange(board, "task-2", {
        toColumnId: "col-a",
        toPosition: 1,
      }),
    ).toBe(false);
  });

  it("is true when the column or position changes", () => {
    const board = twoColumnBoard();

    expect(
      wouldTaskMoveChange(board, "task-2", {
        toColumnId: "col-a",
        toPosition: 0,
      }),
    ).toBe(true);
    expect(
      wouldTaskMoveChange(board, "task-2", {
        toColumnId: "col-b",
        toPosition: 0,
      }),
    ).toBe(true);
  });

  it("is false when the task is not on the board", () => {
    expect(
      wouldTaskMoveChange(twoColumnBoard(), "missing", {
        toColumnId: "col-a",
        toPosition: 0,
      }),
    ).toBe(false);
  });
});
