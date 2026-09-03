import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type {
  CollisionDetection,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
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
  useReorderColumnsMutation,
  useUpdateColumnMutation,
} from "../../hooks/useColumns";
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useMoveTaskMutation,
  useUpdateTaskMutation,
} from "../../hooks/useTasks";
import {
  columnSortableId,
  parseColumnDroppableId,
  parseColumnSortableId,
  parseTaskDndId,
} from "../../dnd/ids";
import "./Board.css";

interface BoardProps {
  board: BoardWithColumns;
}

function resolveColumnTargetId(
  id: string,
  columns: ColumnWithTasks[],
): string | null {
  const sortableId = parseColumnSortableId(id);
  if (sortableId) return sortableId;

  const droppableId = parseColumnDroppableId(id);
  if (droppableId) return droppableId;

  const taskId = parseTaskDndId(id);
  if (!taskId) return null;

  return (
    columns.find((column) => column.tasks.some((task) => task.id === taskId))
      ?.id ?? null
  );
}

const collisionDetection: CollisionDetection = (args) => {
  const activeId = String(args.active.id);
  if (parseColumnSortableId(activeId)) {
    return closestCorners({
      ...args,
      droppableContainers: args.droppableContainers.filter((container) =>
        parseColumnSortableId(String(container.id)),
      ),
    });
  }

  return closestCorners({
    ...args,
    droppableContainers: args.droppableContainers.filter((container) => {
      const id = String(container.id);
      return parseTaskDndId(id) !== null || parseColumnDroppableId(id) !== null;
    }),
  });
};

export function Board({ board }: BoardProps) {
  const { id: boardId, description: boardDescription, columns } = board;
  const createColumnMutation = useCreateColumnMutation(boardId);
  const updateColumnMutation = useUpdateColumnMutation(boardId);
  const deleteColumnMutation = useDeleteColumnMutation(boardId);
  const reorderColumnsMutation = useReorderColumnsMutation(boardId);

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
  const [activeColumn, setActiveColumn] = useState<ColumnWithTasks | null>(
    null,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const columnSortableIds = columns.map((column) =>
    columnSortableId(column.id),
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
    const activeId = String(event.active.id);
    const taskId = parseTaskDndId(activeId);
    if (taskId) {
      const column = findColumnByTaskId(taskId);
      setActiveTask(column?.tasks.find((t) => t.id === taskId) ?? null);
      setActiveColumn(null);
      return;
    }

    const columnId = parseColumnSortableId(activeId);
    setActiveColumn(columns.find((column) => column.id === columnId) ?? null);
    setActiveTask(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    setActiveColumn(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeColumnId = parseColumnSortableId(activeId);
    if (activeColumnId) {
      const overColumnId = resolveColumnTargetId(overId, columns);
      if (!overColumnId || activeColumnId === overColumnId) return;

      const oldIndex = columns.findIndex(
        (column) => column.id === activeColumnId,
      );
      const newIndex = columns.findIndex(
        (column) => column.id === overColumnId,
      );
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;

      reorderColumnsMutation.mutate({
        orderedColumnIds: arrayMove(columns, oldIndex, newIndex).map(
          (column) => column.id,
        ),
      });
      return;
    }

    const activeTaskId = parseTaskDndId(activeId);
    if (!activeTaskId) return;

    const sourceColumn = findColumnByTaskId(activeTaskId);
    if (!sourceColumn) return;

    const overColumnId = parseColumnDroppableId(overId);
    let toColumnId: string;
    let toPosition: number;

    if (overColumnId) {
      const overColumn = columns.find((column) => column.id === overColumnId);
      if (!overColumn) return;
      toColumnId = overColumn.id;
      toPosition = overColumn.tasks.filter((t) => t.id !== activeTaskId).length;
    } else {
      const overTaskId = parseTaskDndId(overId);
      if (!overTaskId || overTaskId === activeTaskId) return;
      const overTaskColumn = findColumnByTaskId(overTaskId);
      if (!overTaskColumn) return;
      toColumnId = overTaskColumn.id;
      toPosition = overTaskColumn.tasks
        .filter((t) => t.id !== activeTaskId)
        .findIndex((t) => t.id === overTaskId);
      if (toPosition < 0) return;
    }

    if (
      sourceColumn.id === toColumnId &&
      sourceColumn.tasks.findIndex((t) => t.id === activeTaskId) === toPosition
    ) {
      return;
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
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="board-columns">
          <SortableContext
            items={columnSortableIds}
            strategy={horizontalListSortingStrategy}
          >
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
          </SortableContext>

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
          {activeColumn && (
            <div className="column column-overlay">
              <div className="column-header">
                <h3 className="column-title">{activeColumn.title}</h3>
              </div>
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
