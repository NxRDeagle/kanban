import type {
  CreateTaskInput,
  MoveTaskInput,
  Task,
  UpdateTaskInput,
} from "../types";
import { commitDb, delay, getDb, id, notFound, now } from "./mockDb";

function tasksInColumn(allTasks: Task[], columnId: string): Task[] {
  return allTasks
    .filter((t) => t.columnId === columnId)
    .sort((a, b) => a.position - b.position);
}

export async function createTask(
  columnId: string,
  input: CreateTaskInput,
): Promise<Task> {
  const db = getDb();
  const column = db.columns.find((c) => c.id === columnId);
  if (!column) {
    throw notFound("Column");
  }

  const position = tasksInColumn(db.tasks, columnId).length;
  const timestamp = now();
  const task: Task = {
    id: id(),
    columnId,
    title: input.title,
    description: input.description ?? null,
    position,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  commitDb({ ...db, tasks: [...db.tasks, task] });
  return delay(task);
}

export async function updateTask(
  taskId: string,
  input: UpdateTaskInput,
): Promise<Task> {
  const db = getDb();
  const existing = db.tasks.find((t) => t.id === taskId);
  if (!existing) {
    throw notFound("Task");
  }

  const updated: Task = {
    ...existing,
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.description !== undefined
      ? { description: input.description }
      : {}),
    updatedAt: now(),
  };

  commitDb({
    ...db,
    tasks: db.tasks.map((t) => (t.id === taskId ? updated : t)),
  });
  return delay(updated);
}

export async function deleteTask(taskId: string): Promise<void> {
  const db = getDb();
  const existing = db.tasks.find((t) => t.id === taskId);
  if (!existing) {
    throw notFound("Task");
  }

  const remainingSiblings = tasksInColumn(db.tasks, existing.columnId)
    .filter((t) => t.id !== taskId)
    .map((t, index) => ({ ...t, position: index }));

  const otherTasks = db.tasks.filter((t) => t.columnId !== existing.columnId);

  commitDb({ ...db, tasks: [...otherTasks, ...remainingSiblings] });
  return delay(undefined);
}

export async function moveTask(
  taskId: string,
  input: MoveTaskInput,
): Promise<Task> {
  const db = getDb();
  const existing = db.tasks.find((t) => t.id === taskId);
  if (!existing) {
    throw notFound("Task");
  }
  const destinationColumn = db.columns.find((c) => c.id === input.toColumnId);
  if (!destinationColumn) {
    throw notFound("Column");
  }

  const timestamp = now();

  if (existing.columnId === input.toColumnId) {
    const siblings = tasksInColumn(db.tasks, existing.columnId).filter(
      (t) => t.id !== taskId,
    );
    const clampedPosition = Math.max(
      0,
      Math.min(input.toPosition, siblings.length),
    );
    const moved: Task = {
      ...existing,
      position: clampedPosition,
      updatedAt: timestamp,
    };
    siblings.splice(clampedPosition, 0, moved);
    const reordered = siblings.map((t, index) => ({ ...t, position: index }));

    const otherTasks = db.tasks.filter((t) => t.columnId !== existing.columnId);
    commitDb({ ...db, tasks: [...otherTasks, ...reordered] });
    return delay(reordered.find((t) => t.id === taskId)!);
  }

  const sourceSiblings = tasksInColumn(db.tasks, existing.columnId)
    .filter((t) => t.id !== taskId)
    .map((t, index) => ({ ...t, position: index }));

  const destinationSiblings = tasksInColumn(db.tasks, input.toColumnId);
  const clampedPosition = Math.max(
    0,
    Math.min(input.toPosition, destinationSiblings.length),
  );
  const moved: Task = {
    ...existing,
    columnId: input.toColumnId,
    position: clampedPosition,
    updatedAt: timestamp,
  };
  destinationSiblings.splice(clampedPosition, 0, moved);
  const reorderedDestination = destinationSiblings.map((t, index) => ({
    ...t,
    position: index,
  }));

  const untouchedTasks = db.tasks.filter(
    (t) => t.columnId !== existing.columnId && t.columnId !== input.toColumnId,
  );

  commitDb({
    ...db,
    tasks: [...untouchedTasks, ...sourceSiblings, ...reorderedDestination],
  });
  return delay(reorderedDestination.find((t) => t.id === taskId)!);
}
