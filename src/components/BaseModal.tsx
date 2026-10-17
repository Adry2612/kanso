"use client";

import { useEffect } from "react";
import { BaseModalProps } from "@/types/components";
import ModalShell from "./ModalShell";

export default function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
}: BaseModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Bloquear scroll del body cuando el modal está abierto
      document.body.style.overflow = "hidden";
    } else {
      // Restaurar scroll del body cuando el modal se cierra
      document.body.style.overflow = "unset";
    }

    // Cleanup: restaurar scroll al desmontar
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

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
