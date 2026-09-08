import { useState } from "react";
import type { FormEvent } from "react";
import type { BoardFormProps } from "./types";

export function useBoardFormModel({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: BoardFormProps) {
  const initialTitle = initialValues?.title ?? "";
  const initialDescription = initialValues?.description ?? "";
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const trimmedTitle = title.trim();
  const canSubmit = !isSubmitting && Boolean(trimmedTitle);
  const submitLabel = mode === "create" ? "Create board" : "Save changes";

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!trimmedTitle) return;
    const trimmedDescription = description.trim();
    onSubmit({
      title: trimmedTitle,
      description: trimmedDescription === "" ? null : trimmedDescription,
    });
  }

  return {
    title,
    description,
    setTitle,
    setDescription,
    canSubmit,
    isSubmitting,
    submitLabel,
    handleSubmit,
    onCancel,
  };
}
