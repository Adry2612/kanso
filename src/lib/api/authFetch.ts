"use client";

import { auth } from "@/lib/firebase";

/**
 * `fetch` autenticado: adjunta el ID token de la sesión en `Authorization`.
 *
 * La API deriva el usuario del token, así que toda llamada a rutas de datos
 * debe pasar por aquí.
 */
export async function authFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);

  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, { ...init, headers });
}
