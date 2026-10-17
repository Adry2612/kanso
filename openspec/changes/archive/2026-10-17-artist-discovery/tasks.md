# Tasks

## 1. Servicio de Spotify

- [x] 1.1 En `services/spotify.ts`, añadir `searchArtists(query)` (búsqueda `type=artist`) y `getArtistAlbums(id)` (paginado con `include_groups=album,single`, deduplicado por id, ordenado por fecha); verificar con `npx tsc --noEmit`
- [x] 1.2 Verificar por lectura que `getArtistAlbums` excluye compilaciones, apariciones y singles de menos de 3 pistas

## 2. Rutas API

- [x] 2.1 Crear `src/app/api/searchArtists/route.ts` (`GET ?q=`) y `src/app/api/getArtistAlbums/route.ts` (`GET ?id=`)
- [x] 2.2 Crear `src/app/api/toggleArtistFavorite/route.ts` (`POST`) y `src/app/api/userArtists/route.ts` (`GET ?userId=`) sobre la colección `users/{uid}/artists`

## 3. Pantallas

- [x] 3.1 Crear `src/app/artists/page.tsx` con buscador de artistas, resultados y sección "Tus artistas" (marcar/desmarcar favorito)
- [x] 3.2 Crear `src/app/artists/[id]/page.tsx` con cabecera del artista y su discografía (álbumes y EPs), enlazando cada disco a `/albums/[albumId]`; estado vacío si no hay álbumes ni EPs
- [x] 3.3 Añadir textos a `src/locales/es.json` y `src/locales/en.json` (namespace `artists`) y el acceso "Artistas" en `src/components/Header.tsx`

## 4. Verificación de integración

- [x] 4.1 Ejecutar `npx tsc --noEmit`, `npm run lint` sin errores nuevos y `npm run build` completando correctamente
- [x] 4.2 Prueba manual: buscar un artista, abrir su ficha y comprobar que solo aparecen álbumes y EPs; marcar/desmarcar favorito y comprobar que persiste; abrir un disco desde la discografía

## Workflow follow-up

- Archivar el change tras la revisión del usuario.
- Verificar el resultado archivado.
