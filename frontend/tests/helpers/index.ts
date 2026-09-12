import type {
  BoardWithColumns,
  ColumnWithTasks,
  Task,
  User,
} from "../../src/types";

const NOW = "2026-01-01T00:00:00.000Z";

export const sampleUser: User = {
  id: "10",
  email: "kanban@example.com",
  username: "user",
  createdAt: NOW,
  updatedAt: NOW,
};

export function makeTask(
  id: string,
  columnId: string,
  position: number,
  title = `Task ${id}`,
): Task {
  return {
    id,
    columnId,
    title,
    description: null,
    position,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

export function makeColumn(
  id: string,
  boardId: string,
  position: number,
  tasks: Task[],
  title = `Column ${id}`,
): ColumnWithTasks {
  return {
    id,
    boardId,
    title,
    position,
    createdAt: NOW,
    updatedAt: NOW,
    tasks,
  };
}

export function makeBoard(columns: ColumnWithTasks[]): BoardWithColumns {
  return {
    id: "board-1",
    ownerId: "10",
    title: "Sprint",
    description: null,
    position: 0,
    createdAt: NOW,
    updatedAt: NOW,
    columns,
  };
}

export function twoColumnBoard(): BoardWithColumns {
  return makeBoard([
    makeColumn("col-a", "board-1", 0, [
      makeTask("task-1", "col-a", 0),
      makeTask("task-2", "col-a", 1),
      makeTask("task-3", "col-a", 2),
    ]),
    makeColumn("col-b", "board-1", 1, [makeTask("task-4", "col-b", 0)]),
  ]);
}
