import { DndContext, DragOverlay } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import AppLoader from "../../components/app-loader/AppLoader";
import BoardCard from "../../components/board/board-card/BoardCard";
import BoardForm from "../../components/board/board-form/BoardForm";
import Modal from "../../components/common/modal/Modal";
import { classNames } from "./classNames";
import { useBoardsPageModel } from "./useBoardsPageModel";
import "./BoardsPage.css";

export default function BoardsPage() {
  const {
    boards,
    isLoading,
    isError,
    isCreating,
    editingBoard,
    editingBoardTitle,
    editingBoardDescription,
    activeBoard,
    activeBoardDescription,
    isDraggingBoard,
    sensors,
    collisionDetection,
    measuring,
    dropAnimation,
    sortableIds,
    boardCardClassNames,
    isCreatingBoard,
    isUpdatingBoard,
    handleCreate,
    handleEditSubmit,
    handleDelete,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    setIsCreating,
    setEditingBoard,
  } = useBoardsPageModel();

  return (
    <div>
      <h1>Boards</h1>

      {isCreating ? (
        <BoardForm
          mode="create"
          onSubmit={handleCreate}
          onCancel={() => setIsCreating(false)}
          isSubmitting={isCreatingBoard}
        />
      ) : (
        <button type="button" onClick={() => setIsCreating(true)}>
          + New board
        </button>
      )}

      {isLoading && <AppLoader />}
      {isError && <p>Something went wrong loading boards.</p>}
      {boards && (
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          measuring={measuring}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
            <div className={classNames.grid}>
              {boards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  onEdit={setEditingBoard}
                  onDelete={handleDelete}
                  isDraggingBoard={isDraggingBoard}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeBoard && (
              <div
                className={`${boardCardClassNames.root} ${boardCardClassNames.overlay}`}
              >
                <h3 className={boardCardClassNames.title}>
                  {activeBoard.title}
                </h3>
                {activeBoardDescription && (
                  <p className={boardCardClassNames.description}>
                    {activeBoardDescription}
                  </p>
                )}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      <Modal
        isOpen={editingBoard !== null}
        onClose={() => setEditingBoard(null)}
        title="Edit board"
      >
        {editingBoard && editingBoardTitle && (
          <BoardForm
            mode="edit"
            initialValues={{
              title: editingBoardTitle,
              description: editingBoardDescription,
            }}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingBoard(null)}
            isSubmitting={isUpdatingBoard}
          />
        )}
      </Modal>
    </div>
  );
}
