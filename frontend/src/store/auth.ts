import { create } from "zustand";
import type { User } from "../types";
import type { AuthState, StoredSession } from "./types";

const STORAGE_KEY = "kanban-auth";

function loadSession(): { token: string | null; user: User | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { token: null, user: null };
    }
    const parsed = JSON.parse(raw) as StoredSession;
    if (typeof parsed.token === "string" && parsed.user) {
      return { token: parsed.token, user: parsed.user };
    }
  } catch {
    // Игнор ошибки
  }
  return { token: null, user: null };
}

function saveSession(token: string | null, user: User | null) {
  if (!token || !user) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  const payload: StoredSession = { token, user };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

const initial = loadSession();

export const useAuthStore = create<AuthState>((set) => ({
  token: initial.token,
  user: initial.user,
  setSession: (token, user) => {
    saveSession(token, user);
    set({ token, user });
  },
  logout: () => {
    saveSession(null, null);
    set({ token: null, user: null });
  },
}));
