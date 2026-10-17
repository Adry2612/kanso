import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getAdminApp, isAdminConfigured } from "./firebaseAdmin";

export type AuthenticatedUser = { uid: string };

/**
 * Verifica el ID token de la petición y devuelve el usuario autenticado.
 *
 * Devuelve `{ uid }` si el token es válido, o una `NextResponse` de error lista
 * para retornar desde la ruta (503 si el servidor no está configurado, 401 si
 * falta el token o no es válido).
 *
 * El `uid` sale SIEMPRE del token: nunca de un identificador enviado por el
 * cliente.
 */
export async function authenticate(
  request: Request,
): Promise<AuthenticatedUser | NextResponse> {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "La autenticación del servidor no está configurada." },
      { status: 503 },
    );
  }

  const header = request.headers.get("authorization");
  const match = /^Bearer\s+(.+)$/i.exec(header ?? "");
  if (!match) {
    return NextResponse.json(
      { error: "Falta el token de autenticación." },
      { status: 401 },
    );
  }

  try {
    const decoded = await getAuth(getAdminApp()).verifyIdToken(match[1]);
    return { uid: decoded.uid };
  } catch {
    return NextResponse.json(
      { error: "Token de autenticación inválido." },
      { status: 401 },
    );
  }
}

/** Devuelve true si el valor es el resultado de error de `authenticate`. */
export function isAuthFailure(
  value: AuthenticatedUser | NextResponse,
): value is NextResponse {
  return value instanceof NextResponse;
}
