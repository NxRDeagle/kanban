import type { Task } from "../../../types";
import type { TaskFormValues } from "../task-form/types";

export interface TaskModalProps {
  task: Task | null;
  onClose: VoidFunction;
  onSubmit: (values: TaskFormValues) => void;
  onDelete: VoidFunction;
  isSubmitting?: boolean;
}
