import { classNames } from "./classNames";
import type { TaskCardProps } from "./types";
import { useTaskCardModel } from "./useTaskCardModel";
import "./TaskCard.css";

export default function TaskCard(props: TaskCardProps) {
  const {
    title,
    description,
    attributes,
    listeners,
    setNodeRef,
    style,
    handleClick,
  } = useTaskCardModel(props);

  return (
    <button
      type="button"
      ref={setNodeRef}
      style={style}
      className={classNames.root}
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      <p className={classNames.title} title={title}>
        {title}
      </p>
      {description && (
        <p className={classNames.description} title={description}>
          {description}
        </p>
      )}
    </button>
  );
}
