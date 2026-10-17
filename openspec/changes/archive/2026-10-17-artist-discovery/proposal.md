# Proposal

## Why

Hoy solo se puede descubrir música buscando por texto y añadiendo álbumes sueltos. No hay forma de seguir a un artista ni de ver su discografía completa, así que es difícil explorar la obra de alguien que te gusta. La persona ha pedido un selector/buscador de artistas con sus álbumes y EPs.

## What Changes

- Nueva sección `/artists` para **buscar artistas** y ver **tus artistas favoritos**.
- Nueva ficha `/artists/[id]` con la **discografía** del artista: solo **álbumes y EPs**, nunca singles, compilaciones ni apariciones.
- Poder **marcar/desmarcar artistas favoritos** (persistido por usuario) y verlos en `/artists`.
- Acceso a la sección desde el panel lateral.

Fuera de alcance: seguir artistas para notificaciones, ordenar/etiquetar artistas y la lógica de recomendación.

## Capabilities

### New Capabilities

- `artist-discovery`: búsqueda de artistas, artistas favoritos y consulta de la discografía de un artista (álbumes y EPs).

### Modified Capabilities

- `navigation`: el panel lateral añade el acceso a Artistas.

## Impact

- `services/spotify.ts`: nuevas funciones `searchArtists` y `getArtistAlbums` (con paginación y filtrado de singles).
- Nuevas rutas API: `src/app/api/searchArtists/route.ts`, `src/app/api/getArtistAlbums/route.ts`, `src/app/api/toggleArtistFavorite/route.ts`, `src/app/api/userArtists/route.ts`.
- Nuevas páginas: `src/app/artists/page.tsx` y `src/app/artists/[id]/page.tsx`.
- Colección Firestore `users/{uid}/artists/{artistId}`.
- `src/components/Header.tsx` (nuevo acceso), `src/locales/es.json`, `src/locales/en.json` (namespace `artists`).
- Nota de seguridad: los endpoints siguen el patrón actual y se endurecen en el change `secure-api-and-firestore`.
