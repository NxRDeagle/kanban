import { Modal } from "../common/Modal";
import { TaskForm } from "./forms/TaskForm";
import type { TaskFormValues } from "./forms/TaskForm";
import type { Task } from "../../types";
import "./TaskModal.css";

interface TaskModalProps {
  task: Task | null;
  onClose: VoidFunction;
  onSubmit: (values: TaskFormValues) => void;
  onDelete: VoidFunction;
  isSubmitting?: boolean;
}

export function TaskModal({
  task,
  onClose,
  onSubmit,
  onDelete,
  isSubmitting,
}: TaskModalProps) {
  return (
    <Modal isOpen={task !== null} onClose={onClose} title="Edit task">
      {task && (
        <div className="task-modal-body">
          <TaskForm
            mode="edit"
            initialValues={{
              title: task.title,
              description: task.description ?? undefined,
            }}
            onSubmit={onSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
          <button
            type="button"
            className="task-modal-delete"
            onClick={onDelete}
            disabled={isSubmitting}
          >
            Delete task
          </button>
        </div>
      )}
    </Modal>
  );
}
