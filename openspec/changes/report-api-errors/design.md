# Design

## Context

Ver `proposal.md` — Why. Estado actual y restricciones que condicionan el enfoque:

- 17 rutas en `src/app/api/**/route.ts`. Todas usan `try/catch` y devuelven una respuesta; **ninguna** llama a Sentry.
- 19 `console.error` repartidos en 13 ficheros. Las otras 4 rutas (`getArtist`, `getArtistAlbums`, `search`, `searchArtists`) ni siquiera registran: construyen `error.message` y lo devuelven al cliente.
- `src/instrumentation.ts` ya registra `onRequestError = Sentry.captureRequestError`, que **solo** ve errores que se propagan sin capturar. En la práctica, los `catch` de las rutas absorben todo.
- `src/lib/sentry.ts` ya concentra `buildSentryOptions` y `redactEvent` (sanitiza cabeceras, cookies, `extra` y `query_string`), con `sendDefaultPii: false` y `tracesSampleRate: 0`.
- Sin DSN, el SDK queda en no-op (`enabled: Boolean(dsn)`): el cambio no puede romper un entorno sin configurar.

## Goals / Non-Goals

**Goals:**

- Que ningún fallo de API vuelva a ser invisible: todos reportados, con la ruta como contexto.
- Un único punto de reporte, trivial de aplicar a rutas nuevas.
- Cero cambios en lo que responde la API, salvo el mensaje genérico de las 4 rutas que hoy filtran.

**Non-Goals:**

- Cambiar la forma de las respuestas (status o cuerpos): ver `proposal.md`.
- Reportar fallos fuera de la API (los `console.error` de componentes y servicios).
- Tocar la configuración de Sentry (DSN, muestreo, mapas de código).
- Métricas, trazas o `captureMessage`: sigue siendo solo errores.

## Decisions

### 1. Un helper en el punto de fallo, no un wrapper de rutas

`reportApiError(error, route, level?)` en `src/lib/sentry.ts`. Alternativas consideradas:

- **Envolver la ruta** (`withErrorReporting(handler)`): tendría que adivinar la respuesta, porque cada `catch` devuelve algo distinto (500 normal, listas vacías degradadas, éxito parcial), hay `catch` anidados (`toggleFavorite`, `feedError`) y helpers internos con su propio `catch` (`artistReleases`). Rechazado: el wrapper no puede garantizar "la misma respuesta que antes" sin que cada ruta se lo diga, y entonces ya no simplifica nada.
- **Dejar propagar el error** y confiar en `onRequestError`: rompe la spec ("la ruta sigue devolviendo su respuesta de error habitual") y el manejo de error del cliente. Rechazado.
- **`Sentry.captureException` suelto en cada `catch`**: repetitivo y obliga a recordar dos llamadas (log + captura). Rechazado en favor del helper.

### 2. El helper también mantiene el `console.error`

El helper hace `console.error(route, error)` **y** `captureException`. Así el log local sigue intacto y el cambio se convierte en un reemplazo mecánico 1:1 de los 19 sitios: mismo esfuerzo, menos riesgo de tocar lógica al editar.

### 3. `level` según el tipo de fallo

Todos los fallos se reportan, pero no con la misma severidad:

| Tipo | Ejemplo | `level` |
| --- | --- | --- |
| Responde con error | `userFavorites`, `search`, `toggleFavorite` | `error` (por defecto) |
| Degrada la respuesta | `communityAlbums`, `communitySearches` | `warning` |
| Fallo parcial tolerado | `feedError` en `toggleFavorite` | `warning` |

Cada reporte lleva `tags: { layer: "api", route: "<nombre>" }`. Alternativa rechazada: reportar solo los 500 — menos ruido, pero deja ciego lo que degrada (un feed de comunidad caído durante días es justo lo que quieres saber); y el ruido se controla mejor con `level` + etiqueta que renunciando a la señal.

### 4. Contexto seguro por defecto

El contexto que se añade es **la ruta**, nada más: ni identificador de usuario, ni cuerpo, ni query. `redactEvent` y `sendDefaultPii: false` siguen actuando como segunda barrera. Alternativa considerada: añadir el `userId` como etiqueta para depurar; rechazada para no meter datos personales en el servicio (ver Open Questions).

### 5. Mensaje genérico en las 4 rutas que filtran

`getArtist`, `getArtistAlbums`, `search` y `searchArtists` dejan de devolver `error.message`. Impacto real en el cliente, comprobado:

- `src/app/search/page.tsx:171-173` **sí** lee el campo `error` y lo muestra (`setError(err.message)`), pero ya tiene respaldo genérico (`|| "Error fetching data"`): seguirá mostrando un texto genérico, no vacío ni roto.
- `src/lib/api/artists.ts` **no** lee el campo: lanza sus propios mensajes. Ahí el cambio es invisible.

## Risks / Trade-offs

- [Un fallo de fondo se repite y genera ruido] → `level: "warning"` en degradaciones y `route` como etiqueta: se filtra o silencia en Sentry sin tocar código.
- [Alguien olvida reportar en una ruta nueva] → el helper se coloca donde ya se escribía el `console.error`; queda como convención para las rutas nuevas.
- [Cambia un texto visible en la búsqueda] → solo `search` lo consume y el respaldo ya era genérico; verificación en la revisión visual.
- [Doble reporte (helper + `onRequestError`)] → cada `catch` sigue devolviendo respuesta, así que el error no se propaga y `onRequestError` no lo vuelve a ver.
- [Reportar degradaciones ensucia las alertas de error] → mitigado con `level: "warning"`.

## Migration Plan

No hay migración de datos ni cambios de esquema. Es un despliegue único; sin DSN el helper solo escribe en consola, que es el comportamiento actual. Rollback: revertir el commit.

## Open Questions

- ¿Conviene añadir el `userId` como etiqueta para depurar fallos por persona? Decidido **no** en este cambio (Decisión 4); se puede revisar más adelante sin tocar specs, enfoque ni tareas.
