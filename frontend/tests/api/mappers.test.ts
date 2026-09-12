import { describe, expect, it } from "vitest";
import {
  mapBoard,
  mapBoardWithColumns,
  mapColumn,
  mapTask,
  mapUser,
} from "../../src/api/mappers";
import type {
  ApiBoard,
  ApiBoardWithColumns,
  ApiColumn,
  ApiTask,
  ApiUser,
} from "../../src/api/types";

const NOW = "2026-01-01T00:00:00.000Z";

const apiBoard: ApiBoard = {
  id: 3,
  ownerId: 10,
  title: "Roadmap",
  description: null,
  position: 2,
  createdAt: NOW,
  updatedAt: NOW,
};

const apiColumn: ApiColumn = {
  id: 8,
  boardId: 3,
  title: "Doing",
  position: 1,
  createdAt: NOW,
  updatedAt: NOW,
};

const apiTask: ApiTask = {
  id: 15,
  columnId: 8,
  title: "Write tests",
  description: null,
  position: 0,
  createdAt: NOW,
  updatedAt: NOW,
};

const apiUser: ApiUser = {
  id: 10,
  email: "kanban@example.com",
  username: "user",
  createdAt: NOW,
  updatedAt: NOW,
};

describe("mappers", () => {
  it("stringifies board ids and keeps a null description and position", () => {
    expect(mapBoard(apiBoard)).toEqual({
      id: "3",
      ownerId: "10",
      title: "Roadmap",
      description: null,
      position: 2,
      createdAt: NOW,
      updatedAt: NOW,
    });
  });

  it("stringifies column and task foreign keys", () => {
    expect(mapColumn(apiColumn)).toMatchObject({
      id: "8",
      boardId: "3",
      title: "Doing",
      position: 1,
    });
    expect(mapTask(apiTask)).toMatchObject({
      id: "15",
      columnId: "8",
      title: "Write tests",
      description: null,
      position: 0,
    });
  });

  it("maps a user id to a string", () => {
    expect(mapUser(apiUser)).toEqual({
      id: "10",
      email: "kanban@example.com",
      username: "user",
      createdAt: NOW,
      updatedAt: NOW,
    });
  });

  it("maps a nested board without turning null descriptions into undefined", () => {
    const apiBoardWithColumns: ApiBoardWithColumns = {
      ...apiBoard,
      columns: [{ ...apiColumn, tasks: [apiTask] }],
    };

    const mapped = mapBoardWithColumns(apiBoardWithColumns);

    expect(mapped.id).toBe("3");
    expect(mapped.description).toBeNull();
    expect(mapped.position).toBe(2);
    expect(mapped.columns).toHaveLength(1);
    expect(mapped.columns[0].id).toBe("8");
    expect(mapped.columns[0].tasks[0]).toMatchObject({
      id: "15",
      columnId: "8",
      description: null,
    });
  });
});
