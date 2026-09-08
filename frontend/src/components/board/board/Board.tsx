import { DndContext, DragOverlay } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import Modal from "../../common/modal/Modal";
import Column from "../column/Column";
import ColumnForm from "../column-form/ColumnForm";
import TaskModal from "../task-modal/TaskModal";
import { classNames } from "./classNames";
import type { BoardProps } from "./types";
import { useBoardModel } from "./useBoardModel";
import "./Board.css";

export default function Board(props: BoardProps) {
  const {
    title,
    description,
    columns,
    sensors,
    collisionDetection,
    measuring,
    dropAnimation,
    columnSortableIds,
    isAddingColumn,
    editingColumn,
    editingColumnTitle,
    editingTask,
    activeTask,
    activeTaskDescription,
    activeColumn,
    isCreatingColumn,
    isUpdatingColumn,
    isAddingTaskPending,
    isTaskModalSubmitting,
    columnClassNames,
    taskCardClassNames,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    handleAddColumn,
    handleEditColumn,
    handleDeleteColumn,
    handleAddTask,
    handleEditTask,
    handleDeleteTask,
    setIsAddingColumn,
    setEditingColumn,
    setEditingTask,
  } = useBoardModel(props);

  return (
    <div>
      <h1>{title}</h1>
      {description && <p className={classNames.description}>{description}</p>}

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        measuring={measuring}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className={classNames.columns}>
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
                isAddingTaskPending={isAddingTaskPending}
              />
            ))}
          </SortableContext>

          <div className={classNames.addColumn}>
            {isAddingColumn ? (
              <ColumnForm
                mode="create"
                onSubmit={handleAddColumn}
                onCancel={() => setIsAddingColumn(false)}
                isSubmitting={isCreatingColumn}
              />
            ) : (
              <button type="button" onClick={() => setIsAddingColumn(true)}>
                + Add column
              </button>
            )}
          </div>
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeTask && (
            <div
              className={`${taskCardClassNames.root} ${taskCardClassNames.overlay}`}
            >
              <p className={taskCardClassNames.title}>{activeTask.title}</p>
              {activeTaskDescription && (
                <p className={taskCardClassNames.description}>
                  {activeTaskDescription}
                </p>
              )}
            </div>
          )}
          {activeColumn && (
            <div
              className={`${columnClassNames.root} ${columnClassNames.overlay}`}
            >
              <div className={columnClassNames.header}>
                <h3 className={columnClassNames.title}>{activeColumn.title}</h3>
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
        {editingColumn && editingColumnTitle && (
          <ColumnForm
            mode="edit"
            initialValues={{ title: editingColumnTitle }}
            onSubmit={handleEditColumn}
            onCancel={() => setEditingColumn(null)}
            isSubmitting={isUpdatingColumn}
          />
        )}
      </Modal>

      <TaskModal
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={handleEditTask}
        onDelete={handleDeleteTask}
        isSubmitting={isTaskModalSubmitting}
      />
    </div>
  );
}
