import type { Board, Column, Task } from "../types";

interface Db {
  boards: Board[];
  columns: Column[];
  tasks: Task[];
}

const STORAGE_KEY = "kanban_mock_db_v1";
const DEMO_OWNER_ID = "demo-owner";
const ARTIFICIAL_DELAY_MS = 300;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function id(): string {
  return crypto.randomUUID();
}

export function now(): string {
  return new Date().toISOString();
}

export function delay<T>(
  value: T,
  ms: number = ARTIFICIAL_DELAY_MS,
): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function seed(): Db {
  const boardId = id();
  const timestamp = now();

  const board: Board = {
    id: boardId,
    ownerId: DEMO_OWNER_ID,
    title: "Demo board",
    description: "A starter board with a few example columns and tasks.",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const columnTitles = ["To do", "In progress", "Done"];
  const columns: Column[] = columnTitles.map((title, position) => ({
    id: id(),
    boardId,
    title,
    position,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));

  const taskTitlesByColumn = [
    [
      "Set up project scaffold",
      "Design the database schema",
      "Write the REST API spec",
    ],
    ["Build the board list page", "Implement drag-and-drop"],
    ["Pick the tech stack"],
  ];

  const tasks: Task[] = columns.flatMap((column, columnIndex) =>
    taskTitlesByColumn[columnIndex].map((title, position) => ({
      id: id(),
      columnId: column.id,
      title,
      description: null,
      position,
      createdAt: timestamp,
      updatedAt: timestamp,
    })),
  );

  return {
    boards: [board],
    columns,
    tasks,
  };
}

let db: Db | null = null;

function load(): Db {
  if (db) {
    return db;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      db = JSON.parse(raw) as Db;
      return db;
    } catch {
      // fallback
    }
  }

  db = seed();
  save(db);
  return db;
}

function save(next: Db): void {
  db = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function getDb(): Db {
  return load();
}

export function commitDb(next: Db): void {
  save(next);
}

export function notFound(resource: string): ApiError {
  return new ApiError(404, `${resource} not found`);
}
