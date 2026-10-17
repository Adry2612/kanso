# Design

## Context

Ver `proposal.md` — Why. La app es Next.js 15 (App Router) + React 19. No hay ninguna herramienta de monitorización. Al cerrar la seguridad, la API dejó de filtrar `error.message` al cliente, así que los fallos del servidor son hoy completamente invisibles.

## Goals / Non-Goals

**Goals:**

- Enterarse de los errores que ocurren en producción (cliente y servidor).
- Que la integración no dependa de tener cuenta para no romper nada: activable y desactivable por configuración.
- No filtrar datos sensibles.

**Non-Goals:**

- Trazas de rendimiento y grabación de sesiones (fuera de alcance por decisión: solo errores).
- Alertas, dashboards o reglas de Sentry (se configuran en su interfaz, no en el código).
- Sustituir los `console.error` existentes (se mantienen como registro local).

## Decisions

### 1. `@sentry/nextjs` con los ficheros de instrumentación oficiales

Se usa el SDK oficial para Next.js (v11) con la estructura recomendada por el *wizard*:

- `instrumentation.ts` — registro por runtime y `onRequestError` para capturar errores de servidor y de rutas.
- `instrumentation-client.ts` — inicialización en el cliente.
- `sentry.server.config.ts` y `sentry.edge.config.ts` — inicialización por runtime.
- `app/global-error.tsx` — frontera de error de React que reporta el fallo y ofrece reintentar.

**Alternativas consideradas**

- _Instrumentar a mano con la API del SDK_: más trabajo y más frágil ante cambios de Next. Descartada.
- _Usar el wizard interactivo sin revisar_: toca el proyecto con valores que aún no existen (org/project). Se replica su resultado de forma controlada.

### 2. Solo errores, y activable por DSN

- `tracesSampleRate: 0` (sin trazas) y sin `replaysSessionSampleRate`.
- `enabled: Boolean(dsn)`: sin DSN, el SDK queda como no-op. Así el cambio se puede integrar y verificar sin cuenta, y activar después poniendo una variable.
- `environment` desde `NEXT_PUBLIC_VERCEL_ENV`/`NODE_ENV` y `release` opcional.

### 3. Sanitización de datos sensibles

- `sendDefaultPii: false`.
- Un `beforeSend` que elimina la cabecera `authorization` de la petición y cualquier campo con pinta de credencial antes de enviar.
- No se habilita la captura de cuerpos de petición.

### 4. Mapas de código opcionales

La subida de source maps necesita `SENTRY_AUTH_TOKEN` + `org`/`project`. Como no hay cuenta todavía, se **desactiva** la subida por defecto (`sourcemaps: { disable: true }`), de modo que el build nunca falla por falta de credenciales; queda documentado cómo activarla. Trade-off: hasta activarlo, las trazas del cliente llegan minificadas.

## Risks / Trade-offs

- [`withSentryConfig` sin org/project] → se desactivan los source maps para que el build no dependa de ello; se verifica el build sin DSN.
- [Ruido en desarrollo] → se puede limitar por `environment`; por defecto se mantiene simple.
- [Sin cuenta no se puede comprobar el envío real] → se verifica con un **receptor local**: un DSN apuntando a un servidor de prueba que acepta el sobre (envelope) y confirma que el error llega. Así se prueba la integración entera sin depender de Sentry.

## Migration Plan

1. Instalar `@sentry/nextjs` y crear los ficheros de instrumentación y la frontera de error.
2. Envolver `next.config.ts` con `withSentryConfig` (source maps desactivados).
3. Documentar las variables en `.env.example`.
4. Verificar: build sin DSN (no-op) y envío real con un receptor local.

## Open Questions

- ¿Se activarán los mapas de código (requiere `SENTRY_AUTH_TOKEN`)? Queda documentado y desactivado hasta que haya cuenta.
