import { describe, expect, it } from "vitest";
import { ApiError } from "../../src/api/http";
import { getErrorMessage } from "../../src/lib/errorMessage";

describe("getErrorMessage", () => {
  it("uses the ApiError message", () => {
    expect(getErrorMessage(new ApiError(400, "Title is required"))).toBe(
      "Title is required",
    );
  });

  it("uses a regular Error message", () => {
    expect(getErrorMessage(new Error("Network down"))).toBe("Network down");
  });

  it("falls back when the value has no useful message", () => {
    expect(getErrorMessage(new Error(""))).toBe("Something went wrong");
    expect(getErrorMessage("nope")).toBe("Something went wrong");
    expect(getErrorMessage(null)).toBe("Something went wrong");
  });
});
