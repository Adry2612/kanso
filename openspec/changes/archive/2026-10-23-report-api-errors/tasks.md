# Tasks

## 1. Helper de reporte

- [x] 1.1 Añadir `reportApiError(error, route, level = "error")` a `src/lib/sentry.ts`: hace `console.error` y `Sentry.captureException` con `tags: { layer: "api", route }` y el `level` indicado; verificar con `npx tsc --noEmit`
- [x] 1.2 Comentar el helper junto a `redactEvent` explicando cuándo usarlo y que sin DSN queda en no-op; verificar que el comentario coincide con lo que hace el código

## 2. Rutas de datos de la persona

- [x] 2.1 Sustituir los `console.error` por `reportApiError(error, "<ruta>")` en `userFavorites`, `userArtists` y `getRecomendationHistory`; verificar que la respuesta (status y cuerpo) es idéntica y que `npx tsc --noEmit` pasa
- [x] 2.2 Hacer lo mismo en `toggleFavorite` (incluido el `catch (feedError)` con `level: "warning"`), `toggleArtistFavorite`, `saveRecomendationHistory` y `removeFavorite`; verificar que guardar un favorito sigue devolviendo su éxito aunque falle el feed

## 3. Rutas de descubrimiento

- [x] 3.1 Sustituir los `console.error` en `getAlbumsByMood`, `getRecommendedAlbumByActivity`, `getAlbumTracklist` y los 4 sitios de `artistReleases` (incluido el de la caché del artista); verificar que ninguna respuesta cambia

## 4. Comunidad: degradación silenciosa

- [x] 4.1 Sustituir los `console.error` de `communityAlbums` y los 3 de `communitySearches` con `level: "warning"`; verificar que siguen devolviendo listas vacías sin romper la pantalla

## 5. Rutas que filtraban detalles internos

- [x] 5.1 En `getArtist`, `getArtistAlbums` y `searchArtists`: añadir el reporte y devolver un mensaje genérico en lugar de `error.message`; verificar con `npx tsc --noEmit`
- [x] 5.2 En `search` (que usa `error: any`): añadir el reporte y mensaje genérico; verificar en `src/app/search/page.tsx` que la búsqueda sigue mostrando un mensaje legible y no vacío

## 6. Verificación

- [x] 6.1 `npx tsc --noEmit`, `npm run lint` y `npm run build` sin errores
- [x] 6.2 `grep -rn "console.error" src/app/api` no devuelve nada (los 34 `console.error` migrados —19 planificados y 15 de rutas posteriores— y las 4 rutas sin registro cubiertas)
- [x] 6.3 Prueba de extremo a extremo: invalidar temporalmente una credencial en `.env` (por ejemplo `SPOTIFY_CLIENT_SECRET`), reiniciar, provocar el fallo de una ruta y comprobar que el evento llega a Sentry con su `route`, su `level` correcto, **una sola vez** (sin duplicado con `onRequestError`) y **sin credenciales**; restaurar la credencial
- [x] 6.4 Revisión visual del usuario: ninguna pantalla cambia de comportamiento y la búsqueda muestra un mensaje genérico

## Workflow follow-up

- Archivar el cambio cuando se cumplan los requisitos de revisión del proyecto.
- Verificar el resultado archivado.
