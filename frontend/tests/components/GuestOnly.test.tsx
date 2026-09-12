import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import GuestOnly from "../../src/components/auth/guest-only/GuestOnly";
import useAuthStore from "../../src/store/auth/useAuthStore";
import { sampleUser } from "../helpers";

function renderGuestRoute() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestOnly>
              <p>login form</p>
            </GuestOnly>
          }
        />
        <Route path="/" element={<p>boards page</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("GuestOnly", () => {
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

  it("shows guest pages when there is no session", () => {
    renderGuestRoute();
    expect(screen.getByText("login form")).toBeInTheDocument();
  });

  it("sends an authenticated user to the boards page", () => {
    useAuthStore.getState().setSession("jwt-token", sampleUser);
    renderGuestRoute();
    expect(screen.getByText("boards page")).toBeInTheDocument();
    expect(screen.queryByText("login form")).not.toBeInTheDocument();
  });
});
