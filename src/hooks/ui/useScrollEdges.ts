"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ScrollEdges = {
  top: boolean;
  bottom: boolean;
};

/**
 * Detecta si un contenedor con scroll tiene contenido oculto arriba o abajo.
 * Sirve para mostrar el difuminado solo en el borde que realmente recorta,
 * también cuando el contenido cambia de tamaño (por ejemplo, al cargar
 * pendientes o abrir la recomendación rápida).
 */
export function useScrollEdges<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [edges, setEdges] = useState<ScrollEdges>({
    top: false,
    bottom: false,
  });

  const update = useCallback(() => {
    const node = ref.current;
    if (!node) return;

    const top = node.scrollTop > 4;
    const bottom = node.scrollTop + node.clientHeight < node.scrollHeight - 4;

    setEdges((current) =>
      current.top === top && current.bottom === bottom
        ? current
        : { top, bottom },
    );
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    update();
    node.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(node);

    const mutationObserver = new MutationObserver(update);
    mutationObserver.observe(node, { childList: true, subtree: true });

    return () => {
      node.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [update]);

  return { ref, edges };
}
