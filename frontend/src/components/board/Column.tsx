import { useState } from "react";
import type { ColumnWithTasks, Task } from "../../types";
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

  function handleAddTask(values: TaskFormValues) {
    onAddTask(column.id, values, () => setIsAddingTask(false));
  }

  return (
    <div className="column">
      <div className="column-header">
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
      <div className="column-tasks">
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={onTaskClick} />
        ))}
      </div>

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
