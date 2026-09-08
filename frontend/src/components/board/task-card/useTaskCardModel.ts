import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { animateLayoutChanges, sortableTransition } from "../../../dnd/config";
import { taskDndId } from "../../../dnd/ids";
import type { TaskCardProps } from "./types";

export function useTaskCardModel({
  task,
  onClick,
  dragDisabled = false,
}: TaskCardProps) {
  const { title, description } = task;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: taskDndId(task.id),
    disabled: dragDisabled,
    animateLayoutChanges,
    transition: sortableTransition,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  function handleClick() {
    onClick(task);
  }

  return {
    title,
    description,
    attributes,
    listeners,
    setNodeRef,
    style,
    handleClick,
  };
}
