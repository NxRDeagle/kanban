export const boardsKeys = {
  all: ["boards"] as const,
  detail: (id: string) => ["boards", id] as const,
};
