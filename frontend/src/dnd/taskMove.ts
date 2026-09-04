import type { BoardWithColumns, MoveTaskInput } from "../types";
import { parseColumnDroppableId, parseTaskDndId } from "./ids";

export function applyOptimisticTaskMove(
  board: BoardWithColumns,
  taskId: string,
  input: MoveTaskInput,
): BoardWithColumns {
  const { columns } = board;

  const sourceColumn = columns.find((column) =>
    column.tasks.some((task) => task.id === taskId),
  );

  const task = sourceColumn?.tasks.find((item) => item.id === taskId);
  if (!sourceColumn || !task) return board;

  if (sourceColumn.id === input.toColumnId) {
    const siblings = sourceColumn.tasks.filter((item) => item.id !== taskId);
    const clamped = Math.max(0, Math.min(input.toPosition, siblings.length));
    siblings.splice(clamped, 0, task);
    const reordered = siblings.map((item, index) => ({
      ...item,
      position: index,
    }));

    return {
      ...board,
      columns: columns.map((column) =>
        column.id === sourceColumn.id
          ? { ...column, tasks: reordered }
          : column,
      ),
    };
  }

  const destColumn = columns.find((column) => column.id === input.toColumnId);
  if (!destColumn) return board;

  const sourceRemaining = sourceColumn.tasks
    .filter((item) => item.id !== taskId)
    .map((item, index) => ({ ...item, position: index }));

  const destTasks = [...destColumn.tasks];
  const clamped = Math.max(0, Math.min(input.toPosition, destTasks.length));
  destTasks.splice(clamped, 0, { ...task, columnId: input.toColumnId });
  const reorderedDest = destTasks.map((item, index) => ({
    ...item,
    position: index,
  }));

  return {
    ...board,
    columns: columns.map((column) => {
      if (column.id === sourceColumn.id) {
        return { ...column, tasks: sourceRemaining };
      }
      if (column.id === destColumn.id) {
        return { ...column, tasks: reorderedDest };
      }
      return column;
    }),
  };
}

export function resolveTaskMoveInput(
  board: BoardWithColumns,
  activeTaskId: string,
  overId: string,
): MoveTaskInput | null {
  const sourceColumn = board.columns.find((column) =>
    column.tasks.some((task) => task.id === activeTaskId),
  );
  if (!sourceColumn) return null;

  const overColumnId = parseColumnDroppableId(overId);
  if (overColumnId) {
    const overColumn = board.columns.find(
      (column) => column.id === overColumnId,
    );
    if (!overColumn) return null;

    return {
      toColumnId: overColumn.id,
      toPosition: overColumn.tasks.filter((task) => task.id !== activeTaskId)
        .length,
    };
  }

  const overTaskId = parseTaskDndId(overId);
  if (!overTaskId || overTaskId === activeTaskId) return null;

  const overTaskColumn = board.columns.find((column) =>
    column.tasks.some((task) => task.id === overTaskId),
  );
  if (!overTaskColumn) return null;

  const toPosition = overTaskColumn.tasks
    .filter((task) => task.id !== activeTaskId)
    .findIndex((task) => task.id === overTaskId);
  if (toPosition < 0) return null;

  return {
    toColumnId: overTaskColumn.id,
    toPosition,
  };
}

export function wouldTaskMoveChange(
  board: BoardWithColumns,
  taskId: string,
  input: MoveTaskInput,
): boolean {
  const sourceColumn = board.columns.find((column) =>
    column.tasks.some((task) => task.id === taskId),
  );
  if (!sourceColumn) return false;

  const currentIndex = sourceColumn.tasks.findIndex(
    (task) => task.id === taskId,
  );
  return !(
    sourceColumn.id === input.toColumnId && currentIndex === input.toPosition
  );
}
