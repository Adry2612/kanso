"use client";

import { auth } from "@/lib/firebase";

/** Evento que avisa a la app de que el token sigue siendo rechazado. */
export const SESSION_INVALID_EVENT = "kanso:session-invalid";
/** Evento que limpia el estado de sesión cuando una petición vuelve a funcionar. */
export const SESSION_VALID_EVENT = "kanso:session-valid";

/**
 * Error tipado para distinguir una sesión rechazada de un fallo de red.
 *
 * Los hooks pueden comprobarlo con `instanceof` si necesitan un tratamiento
 * distinto, aunque el `SessionGuard` ya cubre el caso global.
 */
export class SessionInvalidError extends Error {
  constructor() {
    super("La sesión no se pudo validar.");
    this.name = "SessionInvalidError";
  }
}

function buildHeaders(init: RequestInit, token?: string): Headers {
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

function notify(name: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(name));
  }
}

/**
 * `fetch` autenticado: adjunta el ID token de la sesión en `Authorization`.
 *
 * Si la API responde `401`, refresca el token una sola vez y repite la
 * petición. Si el segundo intento también es rechazado, emite
 * `kanso:session-invalid` y lanza `SessionInvalidError`; nunca cierra la sesión
 * por su cuenta. Un `503` se devuelve tal cual para que la pantalla ofrezca
 * reintentar sin tratar la sesión como inválida.
 */
export async function authFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const user = auth.currentUser;
  if (!user) {
    return fetch(input, init);
  }

  const token = await user.getIdToken();
  const response = await fetch(input, {
    ...init,
    headers: buildHeaders(init, token),
  });

  if (response.status !== 401) {
    return response;
  }

  // Un único refresco: si falla por red, el error se propaga como reintentable
  // y no se muestra el estado de sesión (la sesión podría seguir siendo válida).
  const refreshedToken = await user.getIdToken(true);
  const retried = await fetch(input, {
    ...init,
    headers: buildHeaders(init, refreshedToken),
  });

  if (retried.status === 401) {
    notify(SESSION_INVALID_EVENT);
    throw new SessionInvalidError();
  }

  if (retried.ok) notify(SESSION_VALID_EVENT);
  return retried;
}
