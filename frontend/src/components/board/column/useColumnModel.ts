import { useState } from "react";
import { useDndContext, useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { animateLayoutChanges, sortableTransition } from "../../../dnd/config";
import {
  columnDroppableId,
  columnSortableId,
  parseColumnSortableId,
  taskDndId,
} from "../../../dnd/ids";
import type { TaskFormValues } from "../task-form/types";
import { classNames } from "./classNames";
import type { ColumnProps } from "./types";

export function useColumnModel({
  column,
  onEdit,
  onDelete,
  onTaskClick,
  onAddTask,
  isAddingTaskPending,
}: ColumnProps) {
  const { id, title, tasks } = column;
  const [isAddingTask, setIsAddingTask] = useState(false);
  const { active } = useDndContext();
  const isColumnDragActive =
    active !== null && parseColumnSortableId(String(active.id)) !== null;

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: columnDroppableId(id),
  });
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: columnSortableId(id),
    animateLayoutChanges,
    transition: sortableTransition,
  });

  const taskIds = tasks.map((task) => taskDndId(task.id));
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };
  const rootClassName = isDragging
    ? `${classNames.root} ${classNames.dragging}`
    : classNames.root;
  const tasksClassName = isOver
    ? `${classNames.tasks} ${classNames.tasksOver}`
    : classNames.tasks;

  function handleAddTask(values: TaskFormValues) {
    onAddTask(id, values, () => setIsAddingTask(false));
  }

  function handleEdit() {
    onEdit(column);
  }

  function handleDelete() {
    onDelete(column);
  }

  return {
    title,
    tasks,
    taskIds,
    isAddingTask,
    isAddingTaskPending,
    isColumnDragActive,
    attributes,
    listeners,
    setDroppableRef,
    setSortableRef,
    style,
    rootClassName,
    tasksClassName,
    handleAddTask,
    handleEdit,
    handleDelete,
    onTaskClick,
    setIsAddingTask,
  };
}
