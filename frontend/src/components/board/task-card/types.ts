import type { Task } from "../../../types";

export interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
  dragDisabled?: boolean;
}
