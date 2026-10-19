"use client";

import { useEffect } from "react";

type StartViewTransition = typeof document.startViewTransition;

/**
 * El API de View Transitions lanza `InvalidStateError` («Transition was aborted
 * because of invalid state. Document hidden») si el documento está oculto:
 * pestaña en segundo plano, `bfcache`, o un móvil que dispara `popstate` al
 * volver. `next-view-transitions` no comprueba ese estado y la excepción rompe
 * la navegación.
 *
 * Este guardia deja pasar el cambio de ruta y se salta solo la animación: se
 * pierde la transición, no la navegación.
 */
export default function ViewTransitionGuard() {
  useEffect(() => {
    const start = document.startViewTransition;
    if (!start) return;

    const native = start.bind(document);

    document.startViewTransition = ((callback) => {
      if (document.visibilityState !== "hidden") return native(callback);

      // Documento oculto: ejecuta el cambio igualmente, sin transición.
      const update = typeof callback === "function" ? callback() : undefined;

      return {
        ready: Promise.resolve(),
        updateCallbackDone: Promise.resolve(update),
        finished: Promise.resolve(),
        skipTransition: () => {},
        types: new Set<string>(),
      } as unknown as ReturnType<StartViewTransition>;
    }) as StartViewTransition;

    return () => {
      document.startViewTransition = start;
    };
  }, []);

  return null;
}
