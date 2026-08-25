import type {
  Board,
  BoardWithColumns,
  Column,
  ColumnWithTasks,
  Task,
} from "../types";
import type {
  ApiBoard,
  ApiBoardWithColumns,
  ApiColumn,
  ApiTask,
} from "./types";

export function mapBoard(board: ApiBoard): Board {
  return {
    id: String(board.id),
    ownerId: String(board.ownerId),
    title: board.title,
    description: board.description,
    createdAt: board.createdAt,
    updatedAt: board.updatedAt,
  };
}

export function mapColumn(column: ApiColumn): Column {
  return {
    id: String(column.id),
    boardId: String(column.boardId),
    title: column.title,
    position: column.position,
    createdAt: column.createdAt,
    updatedAt: column.updatedAt,
  };
}

export function mapTask(task: ApiTask): Task {
  return {
    id: String(task.id),
    columnId: String(task.columnId),
    title: task.title,
    description: task.description,
    position: task.position,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

export function mapBoardWithColumns(
  board: ApiBoardWithColumns,
): BoardWithColumns {
  const columns: ColumnWithTasks[] = board.columns.map((column) => ({
    ...mapColumn(column),
    tasks: column.tasks.map(mapTask),
  }));

  return { ...mapBoard(board), columns };
}
