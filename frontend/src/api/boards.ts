import type {
  Board,
  BoardWithColumns,
  CreateBoardInput,
  ReorderBoardsInput,
  UpdateBoardInput,
} from "../types";
import { request, requestNoContent } from "./http";
import { mapBoard, mapBoardWithColumns } from "./mappers";
import type { ApiBoard, ApiBoardWithColumns } from "./types";

export async function getBoards(): Promise<Board[]> {
  const boards = await request<ApiBoard[]>("/boards");
  return boards.map(mapBoard);
}

export async function getBoard(boardId: string): Promise<BoardWithColumns> {
  const board = await request<ApiBoardWithColumns>(`/boards/${boardId}`);
  return mapBoardWithColumns(board);
}

export async function createBoard(input: CreateBoardInput): Promise<Board> {
  const board = await request<ApiBoard>("/boards", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return mapBoard(board);
}

export async function updateBoard(
  boardId: string,
  input: UpdateBoardInput,
): Promise<Board> {
  const board = await request<ApiBoard>(`/boards/${boardId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return mapBoard(board);
}

export async function deleteBoard(boardId: string): Promise<void> {
  await requestNoContent(`/boards/${boardId}`, { method: "DELETE" });
}

export async function reorderBoards(
  input: ReorderBoardsInput,
): Promise<Board[]> {
  const boards = await request<ApiBoard[]>("/boards/reorder", {
    method: "POST",
    body: JSON.stringify({
      orderedBoardIds: input.orderedBoardIds.map(Number),
    }),
  });
  return boards.map(mapBoard);
}
