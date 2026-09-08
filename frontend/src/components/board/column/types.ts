import type { ColumnWithTasks, Task } from "../../../types";
import type { TaskFormValues } from "../task-form/types";

export interface ColumnProps {
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
