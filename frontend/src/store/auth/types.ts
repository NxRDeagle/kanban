import type { User } from "../../types";

export interface StoredSession {
  token: string;
  user: User;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  setSession: (token: string, user: User) => void;
  logout: VoidFunction;
}
