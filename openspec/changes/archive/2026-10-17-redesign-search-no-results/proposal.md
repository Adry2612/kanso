# Proposal

## Why

Cuando una búsqueda no devuelve álbumes, la pantalla muestra hoy un párrafo plano (`t("noAlbumsFound")`) dentro de un recuadro. No explica qué ha pasado ni ofrece ninguna salida: ni limpiar la búsqueda, ni aprovechar la colección, ni probar otra idea. Es un callejón sin salida en el momento exacto en que el usuario buscaba algo.

## What Changes

- Rediseñar el estado sin resultados de `/search` como un estado vacío cuidado que:
  - explica que no hay álbumes para esa búsqueda;
  - muestra el término buscado;
  - ofrece una acción para limpiar la búsqueda;
  - sugiere explorar la colección por emociones y etiquetas cuando existan (reutilizando las sugerencias ya calculadas en la pantalla).
- Mantener el mensaje de error técnico diferenciado del estado sin resultados.

Fuera de alcance: la búsqueda en sí, el estado inicial (cubierto por el change `community-searches`) y la lógica de debounce.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `album-search`: el caso "sin resultados" deja de ser un mensaje plano y pasa a ser un estado vacío accionable.

## Impact

- `src/app/search/page.tsx` (bloque de resultados vacíos y diferenciación de error)
- `src/locales/es.json`, `src/locales/en.json` (textos del estado, namespace `search`)
- Reutiliza `Stagger`/`motion` de `src/components/motion`. Sin nuevas dependencias.
