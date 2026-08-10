import type { Task } from "../../types";
import "./TaskCard.css";

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <button type="button" className="task-card" onClick={() => onClick(task)}>
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
