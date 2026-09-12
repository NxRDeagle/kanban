import type { FormEvent } from "react";
import { vi } from "vitest";

export function submitEvent(): FormEvent {
  return { preventDefault: vi.fn() } as unknown as FormEvent;
}
