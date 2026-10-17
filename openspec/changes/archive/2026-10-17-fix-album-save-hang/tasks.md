# Tasks

## 1. Quitar la dependencia de Spotify en el guardado

- [x] 1.1 En `src/app/api/toggleFavorite/route.ts`, eliminar la llamada a `getArtist(...)` (y su `console.log`) y el import de `getArtist`; retirar `getAlbumAudioFeatures` si queda sin uso; verificar con `npx tsc --noEmit`
- [x] 1.2 Verificar por lectura que el guardado (nuevo y de actualización) no hace ninguna llamada a Spotify

## 2. Cliente y UX de error

- [x] 2.1 En `src/lib/api/favorites.ts`, cambiar la URL a `/api/toggleFavorite` (sin barra final) y añadir `Content-Type: application/json`
- [x] 2.2 En `SaveAlbumModal`, mostrar el error de guardado junto a las acciones y mantener el botón operable para reintentar sin perder el estado del asistente

## 3. Verificación de integración

- [x] 3.1 Ejecutar `npx tsc --noEmit`, `npm run lint` sin errores nuevos y `npm run build` completando correctamente
- [x] 3.2 Verificado E2E contra la API (usuario de prueba): guardar 3 álbumes distintos de una pasada → todos confirman en menos de 600 ms (sin quedarse en el paso de formato); re-guardar actualiza (`alreadyFavorite`); un formato inválido responde 400 con "Formato no válido" (el modal muestra el error y permite reintentar)

## Workflow follow-up

- Archivar el change tras la revisión del usuario.
- Verificar el resultado archivado.
