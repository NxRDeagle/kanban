import { useState } from "react";
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
  useUpdateTaskMutation,
} from "../../hooks/useTasks";
import "./Board.css";

interface BoardProps {
  board: BoardWithColumns;
}

export function Board({ board }: BoardProps) {
  const createColumnMutation = useCreateColumnMutation(board.id);
  const updateColumnMutation = useUpdateColumnMutation(board.id);
  const deleteColumnMutation = useDeleteColumnMutation(board.id);

  const createTaskMutation = useCreateTaskMutation(board.id);
  const updateTaskMutation = useUpdateTaskMutation(board.id);
  const deleteTaskMutation = useDeleteTaskMutation(board.id);

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [editingColumn, setEditingColumn] = useState<ColumnWithTasks | null>(
    null,
  );
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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

  return (
    <div>
      <h1>{board.title}</h1>
      {board.description && (
        <p className="board-description">{board.description}</p>
      )}
      <div className="board-columns">
        {board.columns.map((column) => (
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
