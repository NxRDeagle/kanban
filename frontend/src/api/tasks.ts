import type {
  CreateTaskInput,
  MoveTaskInput,
  Task,
  UpdateTaskInput,
} from "../types";
import { request, requestNoContent } from "./http";
import { mapTask } from "./mappers";
import type { ApiTask } from "./types";

export async function createTask(
  columnId: string,
  input: CreateTaskInput,
): Promise<Task> {
  const task = await request<ApiTask>(`/columns/${columnId}/tasks`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return mapTask(task);
}

export async function updateTask(
  taskId: string,
  input: UpdateTaskInput,
): Promise<Task> {
  const task = await request<ApiTask>(`/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return mapTask(task);
}

export async function deleteTask(taskId: string): Promise<void> {
  await requestNoContent(`/tasks/${taskId}`, { method: "DELETE" });
}

export async function moveTask(
  taskId: string,
  input: MoveTaskInput,
): Promise<Task> {
  const task = await request<ApiTask>(`/tasks/${taskId}/move`, {
    method: "POST",
    body: JSON.stringify({
      toColumnId: Number(input.toColumnId),
      toPosition: input.toPosition,
    }),
  });
  return mapTask(task);
}
