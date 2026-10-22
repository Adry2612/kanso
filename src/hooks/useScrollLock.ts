"use client";

import { useEffect } from "react";

const LOCK_CLASS = "scroll-locked";

let lockCount = 0;
let previousPaddingRight = "";
let previousPathname = "";
let previousAppScrollTop = 0;
let previousWindowScrollY = 0;

function getAppScroller() {
  return document.querySelector<HTMLElement>(".app-content");
}

function lock() {
  if (lockCount === 0) {
    const { body, documentElement } = document;
    const app = getAppScroller();

    previousPaddingRight = body.style.paddingRight;
    previousPathname = window.location.pathname;
    previousAppScrollTop = app?.scrollTop ?? 0;
    previousWindowScrollY = window.scrollY;

    // En escritorio, quitar la barra de scroll desplaza el layout: se compensa
    // con el ancho que ocupaba para que el contenido no salte.
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      const currentPadding =
        Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }

    documentElement.classList.add(LOCK_CLASS);
  }

  lockCount += 1;
}

function unlock() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;

  const { body, documentElement } = document;
  const app = getAppScroller();

  documentElement.classList.remove(LOCK_CLASS);
  body.style.paddingRight = previousPaddingRight;

  // Safari puede perder la posición del scroller al ocultar su overflow. No se
  // restaura si el cierre vino de una navegación: la pantalla nueva empieza
  // arriba y `MobileViewport` ya se encarga de ello.
  if (window.location.pathname !== previousPathname) return;
  if (app) app.scrollTop = previousAppScrollTop;
  if (window.scrollY !== previousWindowScrollY) {
    window.scrollTo({ top: previousWindowScrollY, left: 0 });
  }
}

/**
 * Bloquea el scroll de la página mientras `active` sea true. Usa un contador
 * para que cerrar un modal no libere el fondo si otro sigue abierto.
 *
 * En móvil el scroller es `.app-content`; en escritorio, `body`. La clase
 * `scroll-locked` aplica el bloqueo según el viewport.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lock();
    return unlock;
  }, [active]);
}
