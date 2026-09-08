import { Link } from "react-router-dom";
import { classNames } from "./classNames";
import type { BoardCardProps } from "./types";
import { useBoardCardModel } from "./useBoardCardModel";
import "./BoardCard.css";

export default function BoardCard(props: BoardCardProps) {
  const {
    boardId,
    title,
    description,
    attributes,
    listeners,
    setNodeRef,
    style,
    handleEdit,
    handleDelete,
    handleNavigate,
  } = useBoardCardModel(props);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classNames.sortable}
      {...attributes}
      {...listeners}
    >
      <Link
        to={`/boards/${boardId}`}
        className={classNames.root}
        draggable={false}
        onClick={handleNavigate}
      >
        <div className={classNames.header}>
          <h3 className={classNames.title}>{title}</h3>
          <div className={classNames.actions}>
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={handleEdit}
              aria-label="Edit board"
            >
              Edit
            </button>
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={handleDelete}
              aria-label="Delete board"
            >
              Delete
            </button>
          </div>
        </div>
        {description && <p className={classNames.description}>{description}</p>}
      </Link>
    </div>
  );
}
