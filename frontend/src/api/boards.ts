import type {
  Board,
  BoardWithColumns,
  CreateBoardInput,
  UpdateBoardInput,
} from "../types";
import { commitDb, delay, getDb, id, notFound, now } from "./mockDb";

const DEMO_OWNER_ID = "demo-owner";

function toBoardWithColumns(board: Board): BoardWithColumns {
  const db = getDb();
  const columns = db.columns
    .filter((column) => column.boardId === board.id)
    .sort((a, b) => a.position - b.position)
    .map((column) => ({
      ...column,
      tasks: db.tasks
        .filter((task) => task.columnId === column.id)
        .sort((a, b) => a.position - b.position),
    }));

  return { ...board, columns };
}

export async function getBoards(): Promise<Board[]> {
  const db = getDb();
  return delay([...db.boards]);
}

export async function getBoard(boardId: string): Promise<BoardWithColumns> {
  const db = getDb();
  const board = db.boards.find((b) => b.id === boardId);
  if (!board) {
    throw notFound("Board");
  }
  return delay(toBoardWithColumns(board));
}

export async function createBoard(input: CreateBoardInput): Promise<Board> {
  const db = getDb();
  const timestamp = now();
  const board: Board = {
    id: id(),
    ownerId: DEMO_OWNER_ID,
    title: input.title,
    description: input.description ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  commitDb({ ...db, boards: [...db.boards, board] });
  return delay(board);
}

export async function updateBoard(
  boardId: string,
  input: UpdateBoardInput,
): Promise<Board> {
  const db = getDb();
  const existing = db.boards.find((b) => b.id === boardId);
  if (!existing) {
    throw notFound("Board");
  }

  const updated: Board = {
    ...existing,
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.description !== undefined
      ? { description: input.description }
      : {}),
    updatedAt: now(),
  };

  commitDb({
    ...db,
    boards: db.boards.map((b) => (b.id === boardId ? updated : b)),
  });
  return delay(updated);
}

export async function deleteBoard(boardId: string): Promise<void> {
  const db = getDb();
  const existing = db.boards.find((b) => b.id === boardId);
  if (!existing) {
    throw notFound("Board");
  }

  const columnIds = new Set(
    db.columns.filter((c) => c.boardId === boardId).map((c) => c.id),
  );

  commitDb({
    boards: db.boards.filter((b) => b.id !== boardId),
    columns: db.columns.filter((c) => c.boardId !== boardId),
    tasks: db.tasks.filter((t) => !columnIds.has(t.columnId)),
  });
  return delay(undefined);
}
