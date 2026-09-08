import { classNames } from "./classNames";
import type { ModalProps } from "./types";
import { useModalModel } from "./useModalModel";
import "./Modal.css";

export default function Modal(props: ModalProps) {
  const { isOpen, onClose, title, children } = useModalModel(props);

  if (!isOpen) return null;

  return (
    <div className={classNames.backdrop} onClick={onClose}>
      <div
        className={classNames.content}
        onClick={(event) => event.stopPropagation()}
      >
        {title && <h2 className={classNames.title}>{title}</h2>}
        {children}
      </div>
    </div>
  );
}
