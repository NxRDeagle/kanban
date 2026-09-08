import type { MouseEvent } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { animateLayoutChanges, sortableTransition } from "../../../dnd/config";
import { boardDndId } from "../../../dnd/ids";
import type { BoardCardProps } from "./types";

export function useBoardCardModel({
  board,
  onEdit,
  onDelete,
  isDraggingBoard = false,
}: BoardCardProps) {
  const { id, title, description } = board;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: boardDndId(id),
    animateLayoutChanges,
    transition: sortableTransition,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

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

  function handleNavigate(event: MouseEvent) {
    if (isDragging || isDraggingBoard) {
      event.preventDefault();
    }
  }

  return {
    boardId: id,
    title,
    description,
    attributes,
    listeners,
    setNodeRef,
    style,
    handleEdit,
    handleDelete,
    handleNavigate,
  };
}
