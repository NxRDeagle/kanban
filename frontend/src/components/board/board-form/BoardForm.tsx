import { classNames } from "./classNames";
import type { BoardFormProps } from "./types";
import { useBoardFormModel } from "./useBoardFormModel";
import "./BoardForm.css";

export default function BoardForm(props: BoardFormProps) {
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
  } = useBoardFormModel(props);

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
