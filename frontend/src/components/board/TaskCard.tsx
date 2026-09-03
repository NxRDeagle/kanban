import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../../types";
import { taskDndId } from "../../dnd/ids";
import "./TaskCard.css";

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
  dragDisabled?: boolean;
}

export function TaskCard({
  task,
  onClick,
  dragDisabled = false,
}: TaskCardProps) {
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
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <button
      type="button"
      ref={setNodeRef}
      style={style}
      className="task-card"
      onClick={() => onClick(task)}
      {...attributes}
      {...listeners}
    >
      <p className="task-card-title" title={task.title}>
        {task.title}
      </p>
      {task.description && (
        <p className="task-card-description" title={task.description}>
          {task.description}
        </p>
      )}
    </button>
  );
}
