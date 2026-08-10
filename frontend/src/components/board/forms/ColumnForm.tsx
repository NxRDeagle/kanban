import { useState } from "react";
import type { FormEvent } from "react";
import "./ColumnForm.css";

export interface ColumnFormValues {
  title: string;
}

interface ColumnFormProps {
  mode: "create" | "edit";
  initialValues?: ColumnFormValues;
  onSubmit: (values: ColumnFormValues) => void;
  onCancel: VoidFunction;
  isSubmitting?: boolean;
}

export function ColumnForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: ColumnFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    onSubmit({ title: trimmedTitle });
  }

  return (
    <form className="column-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Column title"
        required
        autoFocus
      />
      <div className="column-form-actions">
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting || !title.trim()}>
          {mode === "create" ? "Add column" : "Save"}
        </button>
      </div>
    </form>
  );
}
