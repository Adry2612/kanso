import "server-only";

import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getAdminApp, isAdminConfigured } from "./firebaseAdmin";
import { classifyAuthFailure, getAuthErrorCode } from "./authFailure";
import { reportApiError } from "./sentry";

export type AuthenticatedUser = {
  uid: string;
  /** La sesión se creó con `signInAnonymously` y no es una cuenta real. */
  isAnonymous: boolean;
};

const SESSION_INVALID_MESSAGE = "Tu sesión no es válida.";
const VERIFIER_UNAVAILABLE_MESSAGE =
  "No pudimos validar tu sesión. Inténtalo de nuevo.";

function reportVerificationFailure(request: Request, code: string) {
  let route = "desconocida";
  try {
    route = new URL(request.url).pathname;
  } catch {
    // La URL siempre debería ser válida en Next; el fallback evita romper la respuesta.
  }

  reportApiError(
    new Error(`Fallo de verificación de identidad (${code})`),
    `auth ${request.method} ${route}`,
    "warning",
  );
}

/**
 * Verifica el ID token de la petición y devuelve el usuario autenticado.
 *
 * Devuelve `{ uid }` si el token es válido, o una `NextResponse` de error lista
 * para retornar desde la ruta:
 * - `401` si falta el token o es inválido, caducado o revocado.
 * - `503` si el verificador no está configurado o no puede validar la identidad
 *   por un fallo de red, certificados o configuración.
 *
 * El `uid` sale SIEMPRE del token: nunca de un identificador enviado por el
 * cliente.
 */
export async function authenticate(
  request: Request,
): Promise<AuthenticatedUser | NextResponse> {
  if (!isAdminConfigured()) {
    reportVerificationFailure(request, "auth/not-configured");
    return NextResponse.json(
      { error: VERIFIER_UNAVAILABLE_MESSAGE },
      { status: 503 },
    );
  }

  const header = request.headers.get("authorization");
  const match = /^Bearer\s+(.+)$/i.exec(header ?? "");
  if (!match) {
    return NextResponse.json(
      { error: SESSION_INVALID_MESSAGE },
      { status: 401 },
    );
  }

  try {
    const decoded = await getAuth(getAdminApp()).verifyIdToken(match[1]);
    return {
      uid: decoded.uid,
      isAnonymous: decoded.firebase?.sign_in_provider === "anonymous",
    };
  } catch (error) {
    const code = getAuthErrorCode(error);
    reportVerificationFailure(request, code);

    if (classifyAuthFailure(error) === 401) {
      return NextResponse.json(
        { error: SESSION_INVALID_MESSAGE },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: VERIFIER_UNAVAILABLE_MESSAGE },
      { status: 503 },
    );
  }
}

/**
 * Restringe una ruta a cuentas registradas.
 *
 * Devuelve `null` si la sesión es válida y una respuesta 403 si es anónima.
 * Se usa después de `authenticate()` para que la comprobación no se pueda
 * saltar llamando directamente a la API.
 */
export function requireRegistered(
  user: AuthenticatedUser,
): NextResponse | null {
  if (!user.isAnonymous) return null;

  return NextResponse.json(
    { error: "Necesitas una cuenta para usar Amigos." },
    { status: 403 },
  );
}

/** Devuelve true si el valor es el resultado de error de `authenticate`. */
export function isAuthFailure(
  value: AuthenticatedUser | NextResponse,
): value is NextResponse {
  return value instanceof NextResponse;
}
