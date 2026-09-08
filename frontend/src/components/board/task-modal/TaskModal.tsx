import Modal from "../../common/modal/Modal";
import TaskForm from "../task-form/TaskForm";
import { classNames } from "./classNames";
import type { TaskModalProps } from "./types";
import { useTaskModalModel } from "./useTaskModalModel";
import "./TaskModal.css";

export default function TaskModal(props: TaskModalProps) {
  const {
    task,
    title,
    description,
    onClose,
    onSubmit,
    onDelete,
    isSubmitting,
  } = useTaskModalModel(props);

  return (
    <Modal isOpen={task !== null} onClose={onClose} title="Edit task">
      {task && title && (
        <div className={classNames.body}>
          <TaskForm
            mode="edit"
            initialValues={{ title, description }}
            onSubmit={onSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
          <button
            type="button"
            className={classNames.delete}
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
