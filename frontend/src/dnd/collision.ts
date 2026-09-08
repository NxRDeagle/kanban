import { closestCorners } from "@dnd-kit/core";
import type { CollisionDetection } from "@dnd-kit/core";
import {
  parseColumnDroppableId,
  parseColumnSortableId,
  parseTaskDndId,
} from "./ids";

export const boardCollisionDetection: CollisionDetection = (args) => {
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
