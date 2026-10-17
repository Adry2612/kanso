"use client";

import { ReactNode, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { BaseModalProps } from "@/types/components";
import { AnimatePresence, motion } from "./motion";

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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* Modal */}
          <motion.div
            className="surface-raised relative flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-[var(--radius-lg)]"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-emerald-100/10 p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#9be7a5]">
                  Ajusta tu colección
                </p>
                <h2 className="display mt-2 text-2xl text-white">{title}</h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="rounded-full bg-emerald-300/10 p-1 text-[#8f9f93] transition hover:bg-emerald-300/20 hover:text-[#9be7a5]"
              >
                <IoClose size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">{children}</div>

            {/* Footer (opcional) */}
            {footer && (
              <div className="border-t border-emerald-100/10 p-6">{footer}</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
