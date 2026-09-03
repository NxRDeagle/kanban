import { Link } from "react-router-dom";
import type { MouseEvent } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Board } from "../../types";
import { boardDndId } from "../../dnd/ids";
import "./BoardCard.css";

interface BoardCardProps {
  board: Board;
  onEdit: (board: Board) => void;
  onDelete: (board: Board) => void;
  isDraggingBoard?: boolean;
}

export function BoardCard({
  board,
  onEdit,
  onDelete,
  isDraggingBoard = false,
}: BoardCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: boardDndId(board.id),
  });

  function handleEdit(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    onEdit(board);
  }

  function handleDelete(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    onDelete(board);
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="board-card-sortable"
      {...attributes}
      {...listeners}
    >
      <Link
        to={`/boards/${board.id}`}
        className="board-card"
        draggable={false}
        onClick={(event) => {
          if (isDragging || isDraggingBoard) {
            event.preventDefault();
          }
        }}
      >
        <div className="board-card-header">
          <h3 className="board-card-title">{board.title}</h3>
          <div className="board-card-actions">
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
        {board.description && (
          <p className="board-card-description">{board.description}</p>
        )}
      </Link>
    </div>
  );
}
