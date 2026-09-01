import type { ApiErrorResponse } from "./types";
import { useAuthStore } from "../store/auth";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function isAuthPath(path: string): boolean {
  return path === "/auth/login" || path === "/auth/register";
}

async function send(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(options.headers);
  if (options.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = useAuthStore.getState().token;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`/api${path}`, { ...options, headers });
}

async function readJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function errorMessage(body: ApiErrorResponse | null): string {
  return body?.error ?? "Request failed";
}

function throwIfFailed(
  path: string,
  response: Response,
  body: ApiErrorResponse | null,
): void {
  if (response.ok) {
    return;
  }
  if (response.status === 401 && !isAuthPath(path)) {
    useAuthStore.getState().logout();
  }
  throw new ApiError(response.status, errorMessage(body));
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await send(path, options);
  const body = await readJson<T>(response);

  if (!response.ok) {
    throwIfFailed(path, response, body as ApiErrorResponse | null);
  }

  if (body === null) {
    throw new ApiError(response.status, "Empty response");
  }

  return body;
}

export async function requestNoContent(
  path: string,
  options: RequestInit = {},
): Promise<void> {
  const response = await send(path, options);
  if (response.ok) {
    return;
  }

  const body = await readJson<ApiErrorResponse>(response);
  throwIfFailed(path, response, body);
}
