import type { UniqueIdentifier } from "@dnd-kit/core";
import type { ColumnWithTasks } from "../types";
import {
  parseColumnDroppableId,
  parseColumnSortableId,
  parseTaskDndId,
} from "./ids";

export function isSameDropTarget(
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier,
): boolean {
  return String(activeId) === String(overId);
}

export function resolveColumnTargetId(
  id: string,
  columns: ColumnWithTasks[],
): string | null {
  const sortableId = parseColumnSortableId(id);
  if (sortableId) return sortableId;

  const droppableId = parseColumnDroppableId(id);
  if (droppableId) return droppableId;

  const taskId = parseTaskDndId(id);
  if (!taskId) return null;

  return (
    columns.find((column) => column.tasks.some((task) => task.id === taskId))
      ?.id ?? null
  );
}
