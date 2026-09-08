import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TaskCard from "../task-card/TaskCard";
import TaskForm from "../task-form/TaskForm";
import { classNames } from "./classNames";
import type { ColumnProps } from "./types";
import { useColumnModel } from "./useColumnModel";
import "./Column.css";

export default function Column(props: ColumnProps) {
  const {
    title,
    tasks,
    taskIds,
    isAddingTask,
    isAddingTaskPending,
    isColumnDragActive,
    attributes,
    listeners,
    setDroppableRef,
    setSortableRef,
    style,
    rootClassName,
    tasksClassName,
    handleAddTask,
    handleEdit,
    handleDelete,
    onTaskClick,
    setIsAddingTask,
  } = useColumnModel(props);

  return (
    <div ref={setSortableRef} style={style} className={rootClassName}>
      <div className={classNames.header}>
        <button
          type="button"
          className={classNames.dragHandle}
          aria-label="Drag column"
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </button>
        <h3 className={classNames.title}>{title}</h3>
        <div className={classNames.actions}>
          <button type="button" onClick={handleEdit} aria-label="Edit column">
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Delete column"
          >
            Delete
          </button>
        </div>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div ref={setDroppableRef} className={tasksClassName}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={onTaskClick}
              dragDisabled={isColumnDragActive}
            />
          ))}
        </div>
      </SortableContext>

      {isAddingTask ? (
        <TaskForm
          mode="create"
          onSubmit={handleAddTask}
          onCancel={() => setIsAddingTask(false)}
          isSubmitting={isAddingTaskPending}
        />
      ) : (
        <button
          type="button"
          className={classNames.addTaskButton}
          onClick={() => setIsAddingTask(true)}
        >
          + Add task
        </button>
      )}
    </div>
  );
}
