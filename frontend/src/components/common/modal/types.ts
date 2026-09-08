import type { ReactNode } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: VoidFunction;
  title?: string;
  children: ReactNode;
}
