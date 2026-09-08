import { useState } from "react";
import type { FormEvent } from "react";
import type { ColumnFormProps } from "./types";

export function useColumnFormModel({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: ColumnFormProps) {
  const initialTitle = initialValues?.title ?? "";
  const [title, setTitle] = useState(initialTitle);
  const trimmedTitle = title.trim();
  const canSubmit = !isSubmitting && Boolean(trimmedTitle);
  const submitLabel = mode === "create" ? "Add column" : "Save";

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!trimmedTitle) return;
    onSubmit({ title: trimmedTitle });
  }

  return {
    title,
    setTitle,
    canSubmit,
    isSubmitting,
    submitLabel,
    handleSubmit,
    onCancel,
  };
}
