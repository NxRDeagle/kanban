import { useState } from "react";
import { useDndContext, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ColumnWithTasks, Task } from "../../types";
import {
  columnDroppableId,
  columnSortableId,
  parseColumnSortableId,
  taskDndId,
} from "../../dnd/ids";
import { animateLayoutChanges, sortableTransition } from "../../dnd/config";
import { TaskCard } from "./TaskCard";
import { TaskForm } from "./forms/TaskForm";
import type { TaskFormValues } from "./forms/TaskForm";
import "./Column.css";

interface ColumnProps {
  column: ColumnWithTasks;
  onEdit: (column: ColumnWithTasks) => void;
  onDelete: (column: ColumnWithTasks) => void;
  onTaskClick: (task: Task) => void;
  onAddTask: (
    columnId: string,
    values: TaskFormValues,
    onDone: VoidFunction,
  ) => void;
  isAddingTaskPending?: boolean;
}

export function Column({
  column,
  onEdit,
  onDelete,
  onTaskClick,
  onAddTask,
  isAddingTaskPending,
}: ColumnProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const { active } = useDndContext();
  const isColumnDragActive =
    active !== null && parseColumnSortableId(String(active.id)) !== null;

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: columnDroppableId(column.id),
  });
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: columnSortableId(column.id),
    animateLayoutChanges,
    transition: sortableTransition,
  });

  function handleAddTask(values: TaskFormValues) {
    onAddTask(column.id, values, () => setIsAddingTask(false));
  }

  const taskIds = column.tasks.map((task) => taskDndId(task.id));
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={`column${isDragging ? " column-dragging" : ""}`}
    >
      <div className="column-header">
        <button
          type="button"
          className="column-drag-handle"
          aria-label="Drag column"
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </button>
        <h3 className="column-title">{column.title}</h3>
        <div className="column-actions">
          <button
            type="button"
            onClick={() => onEdit(column)}
            aria-label="Edit column"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(column)}
            aria-label="Delete column"
          >
            Delete
          </button>
        </div>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setDroppableRef}
          className={`column-tasks${isOver ? " column-tasks-over" : ""}`}
        >
          {column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={onTaskClick}
              dragDisabled={isColumnDragActive}
            />
          ))}
        </div>
      </SortableContext>

      {isAddingTask ? (
        <TaskForm
          mode="create"
          onSubmit={handleAddTask}
          onCancel={() => setIsAddingTask(false)}
          isSubmitting={isAddingTaskPending}
        />
      ) : (
        <button
          type="button"
          className="add-task-button"
          onClick={() => setIsAddingTask(true)}
        >
          + Add task
        </button>
      )}
    </div>
  );
}
