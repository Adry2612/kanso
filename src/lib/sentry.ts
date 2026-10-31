import * as Sentry from "@sentry/nextjs";
import type { ErrorEvent } from "@sentry/nextjs";

// Sanitización: nunca enviar credenciales al servicio de monitorización.

const SECRET_HEADERS = [
  "authorization",
  "cookie",
  "set-cookie",
  "proxy-authorization",
  "x-api-key",
];

const SECRET_KEY =
  /token|secret|password|passwd|api[-_]?key|credential|private[-_]?key|service[-_]?account/i;

export function redactEvent(event: ErrorEvent): ErrorEvent {
  const headers = event.request?.headers as Record<string, string> | undefined;
  if (headers) {
    for (const key of Object.keys(headers)) {
      if (SECRET_HEADERS.includes(key.toLowerCase())) {
        headers[key] = "[redacted]";
      }
    }
  }

  if (event.request) {
    if (event.request.cookies) event.request.cookies = {};
    if (
      typeof event.request.query_string === "string" &&
      SECRET_KEY.test(event.request.query_string)
    ) {
      event.request.query_string = "[redacted]";
    }
  }

  if (event.extra) {
    for (const key of Object.keys(event.extra)) {
      if (SECRET_KEY.test(key)) {
        event.extra[key] = "[redacted]";
      }
    }
  }

  return event;
}

/**
 * Opciones comunes de Sentry: solo errores, sin datos personales por defecto y
 * activado únicamente si hay DSN (sin DSN, el SDK queda como no-op).
 */
export function buildSentryOptions(dsn: string | undefined) {
  return {
    dsn,
    enabled: Boolean(dsn),
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    beforeSend: (event: ErrorEvent) => redactEvent(event),
  };
}

export type ApiErrorLevel = "error" | "warning";

/**
 * Reporta un fallo que una ruta de API ha manejado para responder.
 *
 * Se llama desde cada `catch` de `src/app/api/**`: mantiene el `console.error`
 * local y envía el error a Sentry con la ruta y la capa como contexto, sin
 * datos de la persona. No cambia la respuesta (la construye la ruta) ni bloquea
 * la petición, y sin DSN el SDK queda en no-op: en local solo se ve el log.
 *
 * `level: "warning"` se reserva para degradaciones (listas vacías) y fallos
 * parciales tolerados; el resto se reporta como `error`.
 */
export function reportApiError(
  error: unknown,
  route: string,
  level: ApiErrorLevel = "error",
) {
  if (level === "warning") {
    console.warn(`[api:${route}]`, error);
  } else {
    console.error(`[api:${route}]`, error);
  }
  Sentry.captureException(error, {
    level,
    tags: { layer: "api", route },
  });
}
