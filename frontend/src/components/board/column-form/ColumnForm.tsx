import { classNames } from "./classNames";
import type { ColumnFormProps } from "./types";
import { useColumnFormModel } from "./useColumnFormModel";
import "./ColumnForm.css";

export default function ColumnForm(props: ColumnFormProps) {
  const {
    title,
    setTitle,
    canSubmit,
    isSubmitting,
    submitLabel,
    handleSubmit,
    onCancel,
  } = useColumnFormModel(props);

  return (
    <form className={classNames.root} onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Column title"
        required
        autoFocus
      />
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
