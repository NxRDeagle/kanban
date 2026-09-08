import type { DropAnimation } from "@dnd-kit/core";
import { defaultDropAnimationSideEffects } from "@dnd-kit/core";
import type { AnimateLayoutChanges } from "@dnd-kit/sortable";
import { defaultAnimateLayoutChanges } from "@dnd-kit/sortable";

export const DND_TRANSITION_MS = 250;

export const sortableTransition = {
  duration: DND_TRANSITION_MS,
  easing: "cubic-bezier(0.25, 1, 0.5, 1)",
};

export const dropAnimation: DropAnimation = {
  duration: DND_TRANSITION_MS,
  easing: "cubic-bezier(0.25, 1, 0.5, 1)",
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4",
      },
    },
  }),
};

export const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges(args);
