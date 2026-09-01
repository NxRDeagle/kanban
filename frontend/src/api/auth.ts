import type { User } from "../types";
import { request } from "./http";
import { mapUser } from "./mappers";
import type {
  ApiAuthResponse,
  ApiUser,
  LoginInput,
  RegisterInput,
} from "./types";

export async function register(input: RegisterInput): Promise<{
  token: string;
  user: User;
}> {
  const body = await request<ApiAuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return { token: body.token, user: mapUser(body.user) };
}

export async function login(input: LoginInput): Promise<{
  token: string;
  user: User;
}> {
  const body = await request<ApiAuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return { token: body.token, user: mapUser(body.user) };
}

export async function getMe(): Promise<User> {
  const user = await request<ApiUser>("/auth/me");
  return mapUser(user);
}
