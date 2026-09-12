import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AUTH_STORAGE_KEY } from "../../src/constants";
import useAuthStore from "../../src/store/auth/useAuthStore";
import { sampleUser } from "../helpers";

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  afterEach(() => {
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  it("writes the session to state and localStorage", () => {
    useAuthStore.getState().setSession("jwt-token", sampleUser);

    expect(useAuthStore.getState()).toMatchObject({
      token: "jwt-token",
      user: sampleUser,
    });
    expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? "{}")).toEqual({
      token: "jwt-token",
      user: sampleUser,
    });
  });

  it("clears state and localStorage on logout", () => {
    useAuthStore.getState().setSession("jwt-token", sampleUser);
    useAuthStore.getState().logout();

    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });
});
