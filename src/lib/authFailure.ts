/**
 * Clasificación de los fallos de verificación de identidad.
 *
 * Solo los códigos que identifican un token realmente inválido producen `401`.
 * Cualquier otro fallo (red, certificados, configuración o un código
 * desconocido) es reintentable y produce `503`.
 */
export type AuthFailureStatus = 401 | 503;

const INVALID_TOKEN_CODES = new Set([
  "auth/argument-error",
  "auth/id-token-expired",
  "auth/id-token-revoked",
  "auth/invalid-id-token",
  "auth/user-disabled",
]);

export function getAuthErrorCode(error: unknown): string {
  if (!error || typeof error !== "object") return "auth/unknown";
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : "auth/unknown";
}

export function classifyAuthFailure(error: unknown): AuthFailureStatus {
  return INVALID_TOKEN_CODES.has(getAuthErrorCode(error)) ? 401 : 503;
}
