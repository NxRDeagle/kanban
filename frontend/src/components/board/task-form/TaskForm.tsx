import { classNames } from "./classNames";
import type { TaskFormProps } from "./types";
import { useTaskFormModel } from "./useTaskFormModel";
import "./TaskForm.css";

export default function TaskForm(props: TaskFormProps) {
  const {
    title,
    description,
    setTitle,
    setDescription,
    canSubmit,
    isSubmitting,
    submitLabel,
    handleSubmit,
    onCancel,
  } = useTaskFormModel(props);

  return (
    <form className={classNames.root} onSubmit={handleSubmit}>
      <label className={classNames.field}>
        Title
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          autoFocus
        />
      </label>
      <label className={classNames.field}>
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
        />
      </label>
      <div className={classNames.actions}>
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" disabled={!canSubmit}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
