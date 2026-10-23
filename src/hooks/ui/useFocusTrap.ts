"use client";

import { useEffect, useRef, type RefObject } from "react";

interface UseFocusTrapOptions {
  /** El contenedor solo atrapa el foco mientras está activo. */
  active: boolean;
  containerRef: RefObject<HTMLElement | null>;
  /** Elemento que recibe el foco al activarse. Por defecto, el contenedor. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Se llama al pulsar Escape; normalmente cierra el contenedor. */
  onEscape?: () => void;
}

const FOCUSABLE =
  'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

/**
 * Encierra el foco dentro de un contenedor (cajones, diálogos) y lo devuelve al
 * elemento que lo abrió al desactivarse. Mantiene Tab/Mayús+Tab y Escape.
 */
export function useFocusTrap({
  active,
  containerRef,
  initialFocusRef,
  onEscape,
}: UseFocusTrapOptions) {
  const onEscapeRef = useRef(onEscape);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    (initialFocusRef?.current ?? container)?.focus();

    const focusables = () =>
      Array.from(
        container?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
      ).filter((element) => element.offsetParent !== null);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onEscapeRef.current?.();
        return;
      }

      if (event.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [active, containerRef, initialFocusRef]);
}
