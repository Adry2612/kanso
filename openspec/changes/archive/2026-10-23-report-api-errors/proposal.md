# Proposal

## Why

Cuando se cerró la seguridad, la API dejó de devolver `error.message` al cliente, y con ello los fallos del servidor se volvieron **invisibles**: las 17 rutas de `src/app/api` capturan sus errores con `try/catch` y responden con su error habitual (o con una respuesta degradada). Sentry solo captura errores **no controlados**, así que hoy **ningún fallo de la API llega a la monitorización**, pese a que `error-monitoring` lo exige de forma explícita.

## What Changes

- **Reportar los fallos de las rutas de API.** Un helper `reportApiError(error, route)` en `src/lib/sentry.ts` que registra en consola y envía el error a Sentry con la ruta como contexto. Sustituye las 19 llamadas a `console.error` de la API y añade reporte en las 4 rutas que hoy ni siquiera registran.
- **La respuesta no cambia.** El helper no altera lo que devuelve la ruta: mismo status, mismo cuerpo. Un fallo reportado sigue comportándose exactamente igual para el cliente.
- **Se cubren los tres tipos de fallo**: respuesta 500, degradación silenciosa (listas vacías de la comunidad) y fallo parcial tolerado (el feed de la comunidad al guardar un favorito).
- **Se cierra de paso una fuga.** Cuatro rutas devuelven `error.message` al cliente (`getArtist`, `getArtistAlbums`, `search`, `searchArtists`); pasan todas a un mensaje genérico. El detalle sigue disponible en la monitorización, no en la respuesta.
- **Sin datos sensibles.** La sanitización que ya existe (`redactEvent`) sigue aplicándose; el contexto que se añade es la **ruta**, no la persona ni la petición.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `error-monitoring`: se añade el reporte de los fallos que las **rutas de API manejan** (además de los no controlados), con la ruta como contexto y sin alterar su respuesta.

## Impact

- `src/lib/sentry.ts` — nuevo helper `reportApiError`.
- Las 17 rutas de `src/app/api/**/route.ts` (19 `console.error` en 13 ficheros, más 4 rutas sin registro).
- `src/app/api/{getArtist,getArtistAlbums,search,searchArtists}/route.ts` — dejan de filtrar `error.message` al cliente.

## Fuera de alcance

- Cambiar la forma de las respuestas de error (status o cuerpos): se mantienen idénticos.
- Alertas, cuotas, muestreo o mapas de código en Sentry.
- Migrar los `console.error` que no están en la API (componentes, servicios).
