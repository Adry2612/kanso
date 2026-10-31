/* eslint-disable @next/next/no-img-element -- portada del CDN de Spotify, ampliada sin recorte */
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { IoClose } from "react-icons/io5";
import {
  AnimatePresence,
  EASE_OUT,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "@/components/motion";
import { useTranslations } from "@/context/I18nContext";
import { useScrollLock } from "@/hooks/useScrollLock";

type CoverViewerProps = {
  open: boolean;
  /** URL de la portada que se amplía. */
  src?: string;
  /** Nombre del álbum: etiqueta accesible del diálogo y de la imagen. */
  albumName: string;
  onClose: () => void;
  /** Portada que abrió el visor: recibe el foco al cerrar. */
  returnFocusRef?: RefObject<HTMLElement | null>;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Desplazamiento máximo de la portada hacia el puntero, en píxeles. */
const PARALLAX = 14;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Visor de portada a pantalla completa.
 *
 * Solo contiene la portada y el control de cierre. La portada no se arrastra ni
 * se mueve con clic: al pasar el puntero se desplaza unos píxeles hacia la
 * dirección del ratón y vuelve a su posición al salir (paralaje tipo Spotify),
 * manteniéndose fija en su sitio. El brillo radial sigue al puntero y se
 * intensifica con el movimiento. Se cierra con `Esc`, clic fuera o el botón,
 * atrapa el foco, bloquea el scroll de fondo y lo restaura en el cleanup.
 */
export default function CoverViewer({
  open,
  src,
  albumName,
  onClose,
  returnFocusRef,
}: CoverViewerProps) {
  const t = useTranslations("album");
  const reduceMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  // Muelle suave para que el paralaje siga al puntero sin rigidez y vuelva solo.
  const x = useSpring(rawX, { stiffness: 220, damping: 26, mass: 0.4 });
  const y = useSpring(rawY, { stiffness: 220, damping: 26, mass: 0.4 });
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useScrollLock(open);

  const resetOffset = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    // El paralaje es un efecto de ratón; en táctil no hay hover.
    if (event.pointerType !== "mouse") return;

    const frame = frameRef.current;
    if (!frame) return;

    const rect = frame.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    // Posición relativa al centro del marco, normalizada a [-1, 1].
    const nx = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
    const ny = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);

    if (!reduceMotion) {
      rawX.set(nx * PARALLAX);
      rawY.set(ny * PARALLAX);
    }

    frame.style.setProperty(
      "--cover-glow-x",
      `${clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100)}%`,
    );
    frame.style.setProperty(
      "--cover-glow-y",
      `${clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100)}%`,
    );
  };

  // Al abrir se recentra la portada y se reinicia el brillo. Al salir del
  // puntero vuelve a su posición fija.
  useEffect(() => {
    if (!open) return;

    resetOffset();
    frameRef.current?.style.setProperty("--cover-glow-x", "50%");
    frameRef.current?.style.setProperty("--cover-glow-y", "35%");
  }, [open, resetOffset]);

  useEffect(() => {
    if (!open) return;

    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const returnTarget = returnFocusRef?.current ?? previous;
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (active === last || !dialog.contains(active))
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Safari no enfoca los botones al pulsarlos: la referencia explícita
      // garantiza que el foco vuelva a la portada que abrió el visor.
      returnTarget?.focus();
    };
  }, [open, returnFocusRef]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cover-viewer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        >
          <div
            className="cover-viewer-backdrop"
            onClick={onClose}
            aria-hidden="true"
          />

          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={albumName}
            className="cover-viewer-dialog"
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label={t("closeCover")}
              className="cover-viewer-close"
            >
              <IoClose size={22} aria-hidden="true" />
            </button>

            <motion.div
              ref={frameRef}
              className="cover-viewer-frame"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.94 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.3, ease: EASE_OUT }
              }
              style={{ x, y }}
              onPointerMove={handlePointerMove}
              onPointerLeave={resetOffset}
            >
              <img
                src={src}
                alt={albumName}
                draggable={false}
                className="cover-viewer-image"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
