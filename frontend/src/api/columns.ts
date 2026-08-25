import type { Column, CreateColumnInput, UpdateColumnInput } from "../types";
import { request, requestNoContent } from "./http";
import { mapColumn } from "./mappers";
import type { ApiColumn } from "./types";

export async function createColumn(
  boardId: string,
  input: CreateColumnInput,
): Promise<Column> {
  const column = await request<ApiColumn>(`/boards/${boardId}/columns`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return mapColumn(column);
}

export async function updateColumn(
  columnId: string,
  input: UpdateColumnInput,
): Promise<Column> {
  const column = await request<ApiColumn>(`/columns/${columnId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return mapColumn(column);
}

export async function deleteColumn(columnId: string): Promise<void> {
  await requestNoContent(`/columns/${columnId}`, { method: "DELETE" });
}
