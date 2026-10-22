"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

const MOBILE_QUERY = "(max-width: 1023px)";

// `useLayoutEffect` no existe en el servidor: en SSR se usa `useEffect`, que no
// llega a ejecutarse en el cliente durante la hidratación.
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Ajustes que necesita el marco móvil:
 *
 * - En móvil el scroller es `.app-content`, no `window`; al cambiar de ruta hay
 *   que devolverlo arriba porque la restauración nativa ya no lo hace.
 * - Publica el viewport visual (`visualViewport`) para que los modales se
 *   ajusten cuando aparece el teclado. Con zoom manual (`scale !== 1`) no se
 *   actualiza para no redimensionar el modal mientras se pellizca.
 */
export default function MobileViewport() {
  const pathname = usePathname();

  useIsomorphicLayoutEffect(() => {
    if (!window.matchMedia(MOBILE_QUERY).matches) return;
    const scroller = document.querySelector<HTMLElement>(".app-content");
    if (!scroller) return;
    scroller.scrollTop = 0;
    scroller.scrollLeft = 0;
  }, [pathname]);

  useIsomorphicLayoutEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const root = document.documentElement;
    let frame = 0;

    const sync = () => {
      frame = 0;
      if (viewport.scale !== 1) return;
      root.style.setProperty(
        "--visual-viewport-height",
        `${viewport.height}px`,
      );
      root.style.setProperty(
        "--visual-viewport-top",
        `${viewport.offsetTop}px`,
      );
      // El teclado de iOS no cambia el viewport de layout, así que una media
      // query por altura no basta. Marcamos el estado corto para que los
      // modales puedan compactar su cabecera cuando el área visible baja.
      if (viewport.height < 620) {
        root.setAttribute("data-visual-viewport", "short");
      } else {
        root.removeAttribute("data-visual-viewport");
      }
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(sync);
    };

    sync();
    viewport.addEventListener("resize", schedule);
    viewport.addEventListener("scroll", schedule);
    window.addEventListener("orientationchange", schedule);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      viewport.removeEventListener("resize", schedule);
      viewport.removeEventListener("scroll", schedule);
      window.removeEventListener("orientationchange", schedule);
      root.style.removeProperty("--visual-viewport-height");
      root.style.removeProperty("--visual-viewport-top");
      root.removeAttribute("data-visual-viewport");
    };
  }, []);

  return null;
}
