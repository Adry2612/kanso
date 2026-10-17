# Proposal

## Why

Hoy la aplicación **no tiene ninguna visibilidad de errores en producción**. Si una pantalla revienta al renderizar, si falla el guardado de un álbum o si una ruta de API lanza una excepción, nadie se enteró: no hay registro centralizado y el fallo solo se descubre si alguien lo reporta. Es el hueco más grande que queda tras cerrar la seguridad.

## What Changes

- Integrar **Sentry** en la aplicación Next.js con `@sentry/nextjs`: captura automática de excepciones en **cliente, servidor y rutas de API**.
- **Solo errores** (sin trazas de rendimiento ni grabación de sesiones), para no consumir cuota ni añadir ruido.
- La integración es **activable por configuración**: sin DSN no se envía nada y la app funciona igual (no-op).
- **Sanitización**: no se envían credenciales ni tokens (por ejemplo, la cabecera `Authorization` de la API o la service account).

## Capabilities

### New Capabilities

- `error-monitoring`: la aplicación reporta los errores no controlados a un servicio externo, de forma opcional y sin filtrar datos sensibles.

## Impact

- `package.json`: dependencia `@sentry/nextjs`.
- Nuevos ficheros de instrumentación (`instrumentation.ts`, `instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`) y una frontera de error global (`app/global-error.tsx`).
- `next.config.ts`: envuelto con `withSentryConfig`.
- `.env.example`: variables `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` (y `SENTRY_AUTH_TOKEN` opcional para mapas de código).

## Prerrequisito (decisión del usuario)

- Para **recibir** los errores hace falta un **DSN** de un proyecto de Sentry. Sin él la integración queda instalada y verificada, pero inactiva. Los mapas de código (stack traces legibles) requieren además un `SENTRY_AUTH_TOKEN`.
