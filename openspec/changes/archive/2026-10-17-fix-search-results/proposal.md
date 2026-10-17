# Proposal

## Why

La búsqueda a veces no muestra álbumes aunque hay resultados: la rejilla se anima con `whileInView` y, si no se detecta la intersección (pestaña en segundo plano, o el contenido se monta ya en pantalla), los elementos quedan con `opacity: 0` y la cuadrícula aparece vacía. Además, cuando Spotify responde con error, el endpoint lo entrega con HTTP 200 y la pantalla muestra "sin resultados" en lugar de un error.

## What Changes

- La entrada animada de listas y rejillas de datos deja de depender de `whileInView`: se reproduce al montar, de modo que el contenido nunca queda oculto.
- `GET /api/search` devuelve error cuando la respuesta de Spotify no es un resultado válido, en vez de un 200 con cuerpo de error.
- La búsqueda muestra el error (no el estado "sin resultados") cuando la petición falla.

Fuera de alcance: rediseñar las animaciones del landing público (mantiene el revelado al hacer scroll) y cambiar el ranking de la búsqueda.

## Capabilities

### Modified Capabilities

- `album-search`: los resultados son visibles en cuanto aparecen y los errores se distinguen de "sin resultados".
- `motion-and-transitions`: la entrada escalonada de listas y rejillas de datos se reproduce al aparecer el contenido, sin depender de la intersección.

## Impact

- `src/components/motion/index.tsx` (modo de entrada al montar en `Stagger`).
- Rejillas de datos: `src/app/search`, `src/app/artists`, `src/app/artists/[id]`, `src/app/releases`, `src/app/favorites`, `src/app/recomendationHistory`, `src/app/home/pages/StartPage.tsx`, `src/components/AlbumTracklist.tsx`, `src/components/SortModal.tsx`.
- `src/app/api/search/route.ts`.
