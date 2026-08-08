import { useState } from "react";
import type { FormEvent } from "react";
import "./BoardForm.css";

export interface BoardFormValues {
  title: string;
  description?: string;
}

interface BoardFormProps {
  mode: "create" | "edit";
  initialValues?: BoardFormValues;
  onSubmit: (values: BoardFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function BoardForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: BoardFormProps) {
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
    <form className="board-form" onSubmit={handleSubmit}>
      <label className="board-form-field">
        Title
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />
      </label>
      <label className="board-form-field">
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </label>
      <div className="board-form-actions">
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting || !title.trim()}>
          {mode === "create" ? "Create board" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
