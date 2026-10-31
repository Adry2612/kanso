const GUEST_ENTRY_KEY = "kanso-guest-entry";

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

/** Marca que la persona eligió entrar como invitado en esta pestaña. */
export function markGuestEntry(): void {
  try {
    storage()?.setItem(GUEST_ENTRY_KEY, "1");
  } catch {
    // sessionStorage puede estar bloqueado; la sesión sigue siendo válida.
  }
}

/** Indica si la prueba como invitado se inició explícitamente en esta pestaña. */
export function hasGuestEntry(): boolean {
  try {
    return storage()?.getItem(GUEST_ENTRY_KEY) === "1";
  } catch {
    return false;
  }
}

/** Borra la marca al cerrar sesión o al entrar con una cuenta real. */
export function clearGuestEntry(): void {
  try {
    storage()?.removeItem(GUEST_ENTRY_KEY);
  } catch {
    // Nada que limpiar si el almacenamiento no está disponible.
  }
}
