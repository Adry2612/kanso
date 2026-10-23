"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "kanso-sidebar-collapsed";
/** Clave anterior, de cuando la aplicación se llamaba Collectify. */
const LEGACY_STORAGE_KEY = "collectify-sidebar-collapsed";

/**
 * Estado del panel lateral de escritorio. Recuerda el colapso en
 * `localStorage` y sincroniza las clases del `body` que usa el layout.
 */
export function useSidebar(isPublicPage: boolean) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // En las páginas públicas no hay panel: el contenido ocupa todo el ancho.
    document.body.classList.toggle("public-shell", isPublicPage);

    if (isPublicPage) {
      document.body.classList.remove("sidebar-collapsed");
      return;
    }

    const saved = window.localStorage.getItem(STORAGE_KEY);
    // Se lee una sola vez para no perder la preferencia de quien ya la tenía.
    const stored = saved ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!saved && stored) {
      window.localStorage.setItem(STORAGE_KEY, stored);
    }

    const next = stored === "true";
    setCollapsed(next);
    document.body.classList.toggle("sidebar-collapsed", next);
  }, [isPublicPage]);

  const toggle = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(STORAGE_KEY, String(next));
      document.body.classList.toggle("sidebar-collapsed", next);
      return next;
    });
  }, []);

  return { collapsed, toggle };
}
