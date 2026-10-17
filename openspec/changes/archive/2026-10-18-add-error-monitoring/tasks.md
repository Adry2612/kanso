# Tasks

## 1. Instalación y configuración

- [x] 1.1 Instalar `@sentry/nextjs` (11.8)
- [x] 1.2 Crear `sentry.server.config.ts`, `sentry.edge.config.ts` e `instrumentation-client.ts` (solo errores, `enabled` según DSN)
- [x] 1.3 Crear `src/instrumentation.ts` con `register()` y `onRequestError` — **dentro de `src/`**, que es donde Next lo busca al usar esa carpeta
- [x] 1.4 Envolver `next.config.ts` con `withSentryConfig` (importado de `@sentry/nextjs/config` en v11; mapas de código desactivados)

## 2. Experiencia de error y datos sensibles

- [x] 2.1 Crear `app/global-error.tsx` (sustituye al layout: estilos en línea) y `app/error.tsx`: reportan el fallo y ofrecen reintentar
- [x] 2.2 `beforeSend` que elimina la cabecera `authorization` y cualquier campo con pinta de credencial; `sendDefaultPii: false`
- [x] 2.3 Documentar `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` y `SENTRY_AUTH_TOKEN`/`SENTRY_ORG`/`SENTRY_PROJECT` en `.env.example`

## 3. Verificación

- [x] 3.1 Sin DSN: `tsc`, lint y build correctos, y la app funciona igual (no-op). Build 32/32
- [x] 3.2 Con un receptor local como DSN: un error no controlado en una ruta de API **llega automáticamente** (1 sobre recibido) y un `captureException` explícito también
- [x] 3.3 El reporte **no** incluye el token: la cabecera aparece como `"authorization":"[redacted]"`

## Notas de verificación

- La **captura automática de errores de ruta** (`onRequestError`) funciona en el **build de producción** (`npm start`). En **desarrollo con Turbopack** Next no invoca ese hook, así que ahí solo se reportan los `captureException` explícitos. Consecuencia práctica: la monitorización se comprueba/instrumenta mirando el entorno de producción.
- Los mapas de código quedan desactivados hasta que exista una cuenta con `SENTRY_AUTH_TOKEN` (decisión del usuario: sin cuenta por ahora).

## Fuera de alcance

- Trazas de rendimiento, replays y mapas de código (activables después con cuenta y `SENTRY_AUTH_TOKEN`).
