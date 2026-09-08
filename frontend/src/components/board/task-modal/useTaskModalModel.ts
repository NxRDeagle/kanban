import type { TaskModalProps } from "./types";

export function useTaskModalModel({
  task,
  onClose,
  onSubmit,
  onDelete,
  isSubmitting,
}: TaskModalProps) {
  const title = task?.title;
  const description = task?.description ?? null;

  return {
    task,
    title,
    description,
    onClose,
    onSubmit,
    onDelete,
    isSubmitting,
  };
}
