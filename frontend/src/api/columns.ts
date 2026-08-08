import type {
  Column,
  CreateColumnInput,
  ReorderColumnsInput,
  UpdateColumnInput,
} from "../types";
import { ApiError, commitDb, delay, getDb, id, notFound, now } from "./mockDb";

export async function createColumn(
  boardId: string,
  input: CreateColumnInput,
): Promise<Column> {
  const db = getDb();
  const board = db.boards.find((b) => b.id === boardId);
  if (!board) {
    throw notFound("Board");
  }

  const siblingCount = db.columns.filter((c) => c.boardId === boardId).length;
  const timestamp = now();
  const column: Column = {
    id: id(),
    boardId,
    title: input.title,
    position: siblingCount,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  commitDb({ ...db, columns: [...db.columns, column] });
  return delay(column);
}

export async function updateColumn(
  columnId: string,
  input: UpdateColumnInput,
): Promise<Column> {
  const db = getDb();
  const existing = db.columns.find((c) => c.id === columnId);
  if (!existing) {
    throw notFound("Column");
  }

  const updated: Column = {
    ...existing,
    ...(input.title !== undefined ? { title: input.title } : {}),
    updatedAt: now(),
  };

  commitDb({
    ...db,
    columns: db.columns.map((c) => (c.id === columnId ? updated : c)),
  });
  return delay(updated);
}

export async function deleteColumn(columnId: string): Promise<void> {
  const db = getDb();
  const existing = db.columns.find((c) => c.id === columnId);
  if (!existing) {
    throw notFound("Column");
  }

  const remainingSiblings = db.columns
    .filter((c) => c.boardId === existing.boardId && c.id !== columnId)
    .sort((a, b) => a.position - b.position)
    .map((c, index) => ({ ...c, position: index }));

  const otherColumns = db.columns.filter((c) => c.boardId !== existing.boardId);

  commitDb({
    ...db,
    columns: [...otherColumns, ...remainingSiblings],
    tasks: db.tasks.filter((t) => t.columnId !== columnId),
  });
  return delay(undefined);
}

export async function reorderColumns(
  boardId: string,
  input: ReorderColumnsInput,
): Promise<Column[]> {
  const db = getDb();
  const existingColumns = db.columns.filter((c) => c.boardId === boardId);
  const existingIds = new Set(existingColumns.map((c) => c.id));
  const requestedIds = new Set(input.orderedColumnIds);

  const sameSet =
    existingIds.size === requestedIds.size &&
    [...existingIds].every((columnId) => requestedIds.has(columnId));
  if (!sameSet) {
    throw new ApiError(
      400,
      "orderedColumnIds must match the board's existing columns",
    );
  }

  const timestamp = now();
  const positionById = new Map(
    input.orderedColumnIds.map((columnId, index) => [columnId, index]),
  );
  const reordered = existingColumns.map((c) => ({
    ...c,
    position: positionById.get(c.id)!,
    updatedAt: timestamp,
  }));

  const otherColumns = db.columns.filter((c) => c.boardId !== boardId);

  commitDb({ ...db, columns: [...otherColumns, ...reordered] });
  return delay(reordered.sort((a, b) => a.position - b.position));
}
