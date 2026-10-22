"use client";

import { BaseModalProps } from "@/types/components";
import { useScrollLock } from "@/hooks/useScrollLock";
import ModalShell from "./ModalShell";

export default function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
}: BaseModalProps) {
  useScrollLock(isOpen);

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} size="md">
      <div className="modal-shell-header">
        <p className="modal-shell-eyebrow">Ajusta tu colección</p>
        <h2 className="display mt-2 text-2xl text-[var(--foreground)]">
          {title}
        </h2>
      </div>

      <div className="modal-shell-body">{children}</div>

      {footer && <div className="modal-shell-footer">{footer}</div>}
    </ModalShell>
  );
}
