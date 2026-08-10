import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import type { BoardWithColumns, ColumnWithTasks, Task } from "../../types";
import { Column } from "./Column";
import { ColumnForm } from "./forms/ColumnForm";
import type { ColumnFormValues } from "./forms/ColumnForm";
import type { TaskFormValues } from "./forms/TaskForm";
import { Modal } from "../common/Modal";
import { TaskModal } from "./TaskModal";
import {
  useCreateColumnMutation,
  useDeleteColumnMutation,
  useUpdateColumnMutation,
} from "../../hooks/useColumns";
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useMoveTaskMutation,
  useUpdateTaskMutation,
} from "../../hooks/useTasks";
import "./Board.css";

interface BoardProps {
  board: BoardWithColumns;
}

export function Board({ board }: BoardProps) {
  const { id: boardId, description: boardDescription, columns } = board;
  const createColumnMutation = useCreateColumnMutation(boardId);
  const updateColumnMutation = useUpdateColumnMutation(boardId);
  const deleteColumnMutation = useDeleteColumnMutation(boardId);

  const createTaskMutation = useCreateTaskMutation(boardId);
  const updateTaskMutation = useUpdateTaskMutation(boardId);
  const deleteTaskMutation = useDeleteTaskMutation(boardId);
  const moveTaskMutation = useMoveTaskMutation(boardId);

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [editingColumn, setEditingColumn] = useState<ColumnWithTasks | null>(
    null,
  );
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function findColumnByTaskId(taskId: string): ColumnWithTasks | undefined {
    return columns.find((c) => c.tasks.some((t) => t.id === taskId));
  }

  function handleAddColumn(values: ColumnFormValues) {
    createColumnMutation.mutate(values, {
      onSuccess: () => setIsAddingColumn(false),
    });
  }

  function handleEditColumn(values: ColumnFormValues) {
    if (!editingColumn) return;
    updateColumnMutation.mutate(
      { columnId: editingColumn.id, input: values },
      { onSuccess: () => setEditingColumn(null) },
    );
  }

  function handleDeleteColumn(column: ColumnWithTasks) {
    if (
      !window.confirm(
        `Delete column "${column.title}"? This also deletes its tasks.`,
      )
    ) {
      return;
    }
    deleteColumnMutation.mutate(column.id);
  }

  function handleAddTask(
    columnId: string,
    values: TaskFormValues,
    onDone: VoidFunction,
  ) {
    createTaskMutation.mutate({ columnId, ...values }, { onSuccess: onDone });
  }

  function handleEditTask(values: TaskFormValues) {
    if (!editingTask) return;
    updateTaskMutation.mutate(
      { taskId: editingTask.id, input: values },
      { onSuccess: () => setEditingTask(null) },
    );
  }

  function handleDeleteTask() {
    if (!editingTask) return;
    if (!window.confirm(`Delete task "${editingTask.title}"?`)) return;
    deleteTaskMutation.mutate(editingTask.id, {
      onSuccess: () => setEditingTask(null),
    });
  }

  function handleDragStart(event: DragStartEvent) {
    const taskId = String(event.active.id);
    const column = findColumnByTaskId(taskId);
    setActiveTask(column?.tasks.find((t) => t.id === taskId) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeTaskId = String(active.id);
    const overId = String(over.id);
    if (activeTaskId === overId) return;

    const sourceColumn = findColumnByTaskId(activeTaskId);
    if (!sourceColumn) return;

    const overColumn = columns.find((c) => c.id === overId);
    let toColumnId: string;
    let toPosition: number;

    if (overColumn) {
      toColumnId = overColumn.id;
      toPosition = overColumn.tasks.filter((t) => t.id !== activeTaskId).length;
    } else {
      const overTaskColumn = findColumnByTaskId(overId);
      if (!overTaskColumn) return;
      toColumnId = overTaskColumn.id;
      toPosition = overTaskColumn.tasks
        .filter((t) => t.id !== activeTaskId)
        .findIndex((t) => t.id === overId);
    }

    moveTaskMutation.mutate({
      taskId: activeTaskId,
      input: { toColumnId, toPosition },
    });
  }

  return (
    <div>
      <h1>{board.title}</h1>
      {boardDescription && (
        <p className="board-description">{boardDescription}</p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="board-columns">
          {columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              onEdit={setEditingColumn}
              onDelete={handleDeleteColumn}
              onTaskClick={setEditingTask}
              onAddTask={handleAddTask}
              isAddingTaskPending={createTaskMutation.isPending}
            />
          ))}

          <div className="add-column">
            {isAddingColumn ? (
              <ColumnForm
                mode="create"
                onSubmit={handleAddColumn}
                onCancel={() => setIsAddingColumn(false)}
                isSubmitting={createColumnMutation.isPending}
              />
            ) : (
              <button type="button" onClick={() => setIsAddingColumn(true)}>
                + Add column
              </button>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="task-card task-card-overlay">
              <p className="task-card-title">{activeTask.title}</p>
              {activeTask.description && (
                <p className="task-card-description">
                  {activeTask.description}
                </p>
              )}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <Modal
        isOpen={editingColumn !== null}
        onClose={() => setEditingColumn(null)}
        title="Edit column"
      >
        {editingColumn && (
          <ColumnForm
            mode="edit"
            initialValues={{ title: editingColumn.title }}
            onSubmit={handleEditColumn}
            onCancel={() => setEditingColumn(null)}
            isSubmitting={updateColumnMutation.isPending}
          />
        )}
      </Modal>

      <TaskModal
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={handleEditTask}
        onDelete={handleDeleteTask}
        isSubmitting={
          updateTaskMutation.isPending || deleteTaskMutation.isPending
        }
      />
    </div>
  );
}
