"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useFocusTrap } from "@/hooks/ui/useFocusTrap";

/**
 * Cajón de navegación móvil: apertura, cierre, bloqueo de scroll, foco
 * atrapado y cierre automático al cambiar de sección o al crecer a escritorio.
 */
export function useMobileDrawer(pathname: string) {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useScrollLock(open);

  // El cajón no sobrevive a un cambio de sección.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Si la ventana crece hasta escritorio, el cajón deja de existir: cerrarlo
  // evita quedarse con el scroll del fondo bloqueado.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const handleChange = () => {
      if (desktop.matches) setOpen(false);
    };

    desktop.addEventListener("change", handleChange);
    return () => desktop.removeEventListener("change", handleChange);
  }, []);

  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);

  useFocusTrap({
    active: open,
    containerRef: drawerRef,
    initialFocusRef: closeButtonRef,
    onEscape: closeDrawer,
  });

  return {
    open,
    openDrawer,
    closeDrawer,
    menuButtonRef,
    drawerRef,
    closeButtonRef,
  };
}
