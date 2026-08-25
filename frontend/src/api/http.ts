import type { ApiErrorResponse } from "./types";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function send(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(options.headers);
  if (options.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
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

export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await send(path, options);
  const body = await readJson<T>(response);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      errorMessage(body as ApiErrorResponse | null),
    );
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
  throw new ApiError(response.status, errorMessage(body));
}
