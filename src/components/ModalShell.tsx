"use client";

import { ReactNode, useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { AnimatePresence, motion } from "./motion";

type ModalShellSize = "md" | "lg" | "xl";

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Background media for the hero area (e.g. the artist artwork). */
  hero?: ReactNode;
  /** Small badge shown over the hero, top-left. */
  heroBadge?: ReactNode;
  /** Panel width. `md` for content modals, `lg` for the save wizard. */
  size?: ModalShellSize;
  /** Forwarded to `aria-labelledby` on the dialog. */
  labelledBy?: string;
  /** Accessible label for the close button. Defaults to "Cerrar". */
  closeLabel?: string;
  className?: string;
}

/**
 * Single visual shell shared by every modal in the app.
 *
 * Radius rule: the shell uses `--radius-lg`, the actions inside it use
 * `--radius-md` and chips stay pill-shaped. Actions share one hierarchy
 * (`.modal-action-primary` / `-secondary` / `-danger`), the close button is the
 * same everywhere and the header/body/actions classes (`modal-shell-*`) keep
 * one modal language across sort, filter, save/edit, success and already-saved.
 */
export default function ModalShell({
  isOpen,
  onClose,
  children,
  hero,
  heroBadge,
  size = "md",
  labelledBy,
  closeLabel = "Cerrar",
  className = "",
}: ModalShellProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Al abrir, el foco entra en el modal; al cerrar, vuelve al disparador.
  useEffect(() => {
    if (!isOpen) return;

    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onCloseRef.current();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previous?.focus();
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-shell-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            className={`modal-shell-panel ${
              size === "lg"
                ? "modal-shell-panel--lg"
                : size === "xl"
                  ? "modal-shell-panel--xl"
                  : ""
            } ${className}`}
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="modal-shell-close"
            >
              <IoClose size={20} />
            </button>

            {hero && (
              <div className="modal-shell-hero">
                {hero}
                <div className="modal-shell-hero-content">
                  {heroBadge ? (
                    <div className="modal-shell-hero-badge">{heroBadge}</div>
                  ) : (
                    <span />
                  )}
                </div>
              </div>
            )}

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
