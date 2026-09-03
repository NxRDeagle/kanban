const TASK_PREFIX = "task:";
const COLUMN_PREFIX = "column:";
const COLUMN_DROP_PREFIX = "column-drop:";
const BOARD_PREFIX = "board:";

function parsePrefixed(id: string, prefix: string): string | null {
  if (!id.startsWith(prefix)) return null;
  return id.slice(prefix.length);
}

export function taskDndId(id: string): string {
  return `${TASK_PREFIX}${id}`;
}

export function parseTaskDndId(id: string): string | null {
  return parsePrefixed(id, TASK_PREFIX);
}

export function columnSortableId(id: string): string {
  return `${COLUMN_PREFIX}${id}`;
}

export function parseColumnSortableId(id: string): string | null {
  return parsePrefixed(id, COLUMN_PREFIX);
}

export function columnDroppableId(id: string): string {
  return `${COLUMN_DROP_PREFIX}${id}`;
}

export function parseColumnDroppableId(id: string): string | null {
  return parsePrefixed(id, COLUMN_DROP_PREFIX);
}

export function boardDndId(id: string): string {
  return `${BOARD_PREFIX}${id}`;
}

export function parseBoardDndId(id: string): string | null {
  return parsePrefixed(id, BOARD_PREFIX);
}
