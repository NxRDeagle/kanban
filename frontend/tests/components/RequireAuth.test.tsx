import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import RequireAuth from "../../src/components/auth/require-auth/RequireAuth";
import useAuthStore from "../../src/store/auth/useAuthStore";
import { sampleUser } from "../helpers";

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={["/boards/1"]}>
      <Routes>
        <Route
          path="/boards/:boardId"
          element={
            <RequireAuth>
              <p>board detail</p>
            </RequireAuth>
          }
        />
        <Route path="/login" element={<p>login page</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RequireAuth", () => {
  beforeEach(() => {
    cleanup();
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  it("redirects guests to login", () => {
    renderProtected();
    expect(screen.getByText("login page")).toBeInTheDocument();
    expect(screen.queryByText("board detail")).not.toBeInTheDocument();
  });

  it("renders children when a session exists", () => {
    useAuthStore.getState().setSession("jwt-token", sampleUser);
    renderProtected();
    expect(screen.getByText("board detail")).toBeInTheDocument();
  });
});
