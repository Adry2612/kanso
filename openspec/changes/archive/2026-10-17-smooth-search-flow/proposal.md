# Proposal

## Why

La búsqueda funciona, pero ensucia su propio feed: el registro en "búsquedas de la comunidad" usa el mismo retardo de 500 ms que los resultados, así que guarda términos a medio escribir (`extre`), variantes de la misma búsqueda (`nos queda de guapos` / `por lo que nos queda de guapos` / `lo que nos queda de guapos`) y mezcla mayúsculas (`NACH`, `DELLAFUENTE`, `extremoduro`). Además, al escribir rápido no se cancelan las peticiones en vuelo, así que una respuesta vieja puede pisar a la nueva.

## What Changes

- Registrar un término solo cuando la consulta se asienta (una pausa mayor que el retardo de resultados), con un mínimo de 3 caracteres, sin repetir el mismo término seguido y sustituyendo el prefijo parcial por el término definitivo.
- Normalizar el término (minúsculas y espacios) tanto al guardarlo como al mostrarlo.
- Cancelar la búsqueda anterior en vuelo para no mostrar resultados obsoletos.

Fuera de alcance: ranking de búsquedas, moderación y cambiar el retardo de los resultados (se mantiene en 500 ms).

## Capabilities

### Modified Capabilities

- `community-searches`: registro más limpio y términos normalizados en la sección de la comunidad.
- `album-search`: resultados sin obsolescencia al escribir rápido.

## Impact

- `src/app/search/page.tsx` (registro con asentamiento propio, coalescencia de prefijos y cancelación de peticiones).
- `src/app/api/communitySearches/route.ts` (normalización, mínimo de longitud y soporte de `previousTerm`).
