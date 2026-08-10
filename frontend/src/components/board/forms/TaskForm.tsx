import { useState } from "react";
import type { FormEvent } from "react";
import "./TaskForm.css";

export interface TaskFormValues {
  title: string;
  description?: string;
}

interface TaskFormProps {
  mode: "create" | "edit";
  initialValues?: TaskFormValues;
  onSubmit: (values: TaskFormValues) => void;
  onCancel: VoidFunction;
  isSubmitting?: boolean;
}

export function TaskForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    onSubmit({
      title: trimmedTitle,
      description: description.trim() || undefined,
    });
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label className="task-form-field">
        Title
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />
      </label>
      <label className="task-form-field">
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </label>
      <div className="task-form-actions">
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting || !title.trim()}>
          {mode === "create" ? "Add task" : "Save"}
        </button>
      </div>
    </form>
  );
}
