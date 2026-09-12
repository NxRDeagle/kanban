import { describe, expect, it } from "vitest";
import {
  boardDndId,
  columnDroppableId,
  columnSortableId,
  parseBoardDndId,
  parseColumnDroppableId,
  parseColumnSortableId,
  parseTaskDndId,
  taskDndId,
} from "../../src/dnd/ids";

describe("dnd ids", () => {
  it("keeps task, column, droppable, and board prefixes distinct", () => {
    const id = "1";

    expect(taskDndId(id)).toBe("task:1");
    expect(columnSortableId(id)).toBe("column:1");
    expect(columnDroppableId(id)).toBe("column-drop:1");
    expect(boardDndId(id)).toBe("board:1");

    expect(parseTaskDndId(columnSortableId(id))).toBeNull();
    expect(parseTaskDndId(columnDroppableId(id))).toBeNull();
    expect(parseColumnSortableId(taskDndId(id))).toBeNull();
    expect(parseColumnSortableId(columnDroppableId(id))).toBeNull();
    expect(parseColumnDroppableId(columnSortableId(id))).toBeNull();
    expect(parseBoardDndId(taskDndId(id))).toBeNull();
  });

  it("round-trips prefixed ids", () => {
    expect(parseTaskDndId(taskDndId("42"))).toBe("42");
    expect(parseColumnSortableId(columnSortableId("7"))).toBe("7");
    expect(parseColumnDroppableId(columnDroppableId("9"))).toBe("9");
    expect(parseBoardDndId(boardDndId("3"))).toBe("3");
  });

  it("returns null for unmatched prefixes", () => {
    expect(parseTaskDndId("column:1")).toBeNull();
    expect(parseTaskDndId("1")).toBeNull();
    expect(parseColumnDroppableId("column:1")).toBeNull();
    expect(parseBoardDndId("board")).toBeNull();
  });
});
