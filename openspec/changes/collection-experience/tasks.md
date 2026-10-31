# Tasks

## 1. Preparación y coordinación

- [x] 1.1 Confirmar con `openspec list --json` que `refactor-frontend-architecture` sigue activo y que `report-api-errors` está archivado; anotar en `openspec/changes/refactor-frontend-architecture/tasks.md` que 7.1, 7.2, 7.4 y 7.7 quedan absorbidas por este cambio, sin marcar el resto
- [x] 1.2 Registrar la línea base con `npx tsc --noEmit`, `npm run lint` y `npm run build`; guardar el resultado para comparar y no empezar con fallos previos
- [x] 1.3 Inventariar las referencias con `grep -rn "favorit\|Favorit" src scripts docs README.md bruno` y confirmar que la lista cubre tipos, utilidades, hooks, componentes, rutas, textos, Firestore y Bruno

## 2. Renombrado interno a colección

- [x] 2.1 Renombrar `src/types/favorites.ts` a `src/types/collection.ts` y sus tipos (`CollectionAlbum`, `CollectionFormat`, `CollectionTag`, `GroupedCollection`, `CollectionTab`, `SaveCollectionResponse`); actualizar todos los imports y verificar con `npx tsc --noEmit`
- [x] 2.2 Fusionar `src/utils/favorites.ts` y `favoritesHelper.ts` en `src/utils/collection.ts`, renombrar sus funciones y añadir los contadores de artistas y emociones; actualizar consumidores y verificar con `npx tsc --noEmit`
- [x] 2.3 Renombrar `useFavoritesPage` a `useCollectionPage` y `useFavoritesFilter` a `useCollectionFilter`, mover el segundo a `src/hooks/client/` y verificar con `npx tsc --noEmit`
- [x] 2.4 Renombrar `src/services/client/favorites.ts` a `collection.ts` (`getCollection`, `saveCollectionAlbum`, `removeCollectionAlbum`) y actualizar todos los consumidores; verificar con `npx tsc --noEmit` y `grep -rn "services/client/favorites" src`
- [x] 2.5 Renombrar el directorio `src/app/favorites` a `src/app/collection`, los componentes `Favorites*` a `Collection*` y los enlaces internos; verificar con `npx tsc --noEmit` y `grep -rn '"/favorites' src` (solo debe quedar la redirección)
- [x] 2.6 Renombrar en `src/services/server/collection` los identificadores internos (`FavoriteWrite`, `FavoriteRecord`, `toggleFavorite`, `removeFavorite`, `listFavorites`) y `normalizeFavoriteFormats` a `normalizeCollectionFormats`; actualizar `friendLibrary` y `recommendations` y verificar con `npx tsc --noEmit` y `npm run lint`
- [x] 2.7 Eliminar `src/lib/api/favorites.ts` (sin consumidores) y `src/lib/favorites.ts` tras mover sus imports a `src/utils/formats.ts`; verificar con `grep -rn "lib/api/favorites\|lib/favorites" src` y `npx tsc --noEmit`

## 3. API de colección y servicio de servidor

- [x] 3.1 Crear `src/app/api/collection/route.ts` con `GET`, `POST` y `DELETE` como adaptadores finos sobre `services/server/collection`, con autenticación, validación, `CollectionApiError` y `reportApiError`; verificar que `grep -n "adminDb" src/app/api/collection/route.ts` no devuelve nada
- [x] 3.2 Cambiar el listado a `{ collection: CollectionAlbum[] }` y el borrado a `DELETE /api/collection?albumId=<spotifyId>`, actualizando el servicio cliente; verificar con `npx tsc --noEmit`
- [x] 3.3 Eliminar `src/app/api/userFavorites`, `toggleFavorite` y `removeFavorite`, y confirmar con `grep -rn "userFavorites\|toggleFavorite\|removeFavorite" src` que no quedan llamadas (salvo favoritos de artistas)
- [x] 3.4 Conectar `src/app/api/listenLater/route.ts` al servicio de colección sin cambiar su contrato; verificar con `grep -n "adminDb" src/app/api/listenLater/route.ts` y Bruno
- [ ] 3.5 Comprobar guardado nuevo, guardado repetido, actualización, borrado idempotente, exclusividad colección/pendientes, feed de comunidad y código 401 con Bruno `02-collection` y `03-listen-later`
- [ ] 3.6 Verificar que el asistente sigue guardando y deshaciendo desde búsqueda y detalle de álbum, y que los avisos no mencionan «favoritos»

## 4. Rutas de recomendaciones adelgazadas

- [x] 4.1 Ampliar `src/services/server/recommendations.ts` con `recommendByMood`, `listRecommendationHistory` y `saveRecommendationHistory`, reutilizando `recommendByActivity` como única implementación de actividad; verificar con `npx tsc --noEmit`
- [x] 4.2 Adelgazar `getAlbumsByMood`, `getRecommendedAlbumByActivity`, `getRecomendationHistory` y `saveRecomendationHistory` para que solo autentiquen, validen, llamen al servicio y mapeen errores; verificar que `grep -n "adminDb"` no encuentra nada en esas cuatro rutas
- [ ] 4.3 Confirmar con Bruno `06-recommendations` y `04-search` que las respuestas, incluido el 404 de «sin coincidencias», no cambian; comprobar recomendación por emoción, por actividad, historial y guardado automático
- [x] 4.4 Revisar que `src/lib/activityRecommendations.ts` solo reexporta utilidades puras y que ninguna ruta importa Firestore directamente

## 5. Migración de datos y lectura dual

- [x] 5.1 Crear `src/services/server/collection/legacy.ts` con las rutas nueva y antigua y una lectura combinada por id (la nueva gana); usarla en el repositorio de colección, `friendLibrary` y `recommendations`, y hacer que guardar/borrar elimine la copia antigua; verificar con `npx tsc --noEmit`
- [x] 5.2 Escribir `scripts/migrate-collection.mjs` con `collectionGroup("favorites")`, copia idempotente, `--dry-run`, `--user`, `--delete-source`, detección de conflictos y resumen final; añadir `migrate:collection` y `migrate:collection:dry` a `package.json`
- [ ] 5.3 Probar el script contra un entorno de pruebas con al menos una cuenta con álbumes: `--dry-run`, ejecución real, segunda ejecución sin cambios y conflicto simulado; verificar recuentos y que no se borra nada con conflicto
- [ ] 5.4 Ejecutar la migración en producción tras el despliegue, comparar recuentos origen/destino por usuario y comprobar la colección y la biblioteca compartida con una cuenta migrada
- [ ] 5.5 Retirar la lectura dual y las constantes heredadas una vez verificada la migración; comprobar con `grep -rn "users/.*favorites" src` y `npx tsc --noEmit`

## 6. Presentación compartida y nueva UI

- [x] 6.1 Generalizar `groupByDate` en `src/utils/dates.ts` para aceptar un accesor de fecha y el locale activo, y actualizar el historial; verificar que las fechas cambian entre español e inglés y que el historial mantiene su orden
- [x] 6.2 Extraer a `src/components/gallery/` las primitivas `GalleryCard`, `GalleryRow`, `GalleryGroupHeader`, `GalleryViewToggle`, `GalleryStats` y `GallerySkeleton`, y refactorizar el historial para usarlas sin cambios visuales; verificar con `npm run lint` y una comparación manual antes/después
- [x] 6.3 Rehacer `src/app/collection/page.tsx` con cabecera y resumen, pestañas, buscador con vista cuadrícula/lista, chips de emoción, filtros activos, grupos, tarjetas/filas y estados vacío/error/carga; verificar con `npx tsc --noEmit`, `npm run lint` y `npm run build`
- [x] 6.4 Aplicar la misma presentación a la pestaña «Por escuchar», con resumen de total y artistas, fecha de incorporación y agrupación por fecha; verificar que no muestra filtros ni emociones de colección
- [x] 6.5 Verificar la agrupación y el orden con las siete ordenaciones: fecha en ambos sentidos agrupa por fecha y las demás por artista, letra o año; comprobar que los grupos y sus recuentos son correctos
- [x] 6.6 Revisar la vista en 320, 390, 768 y escritorio, con teclado y lector de pantalla: foco en enlaces y botón de Spotify, etiquetas del conmutador, sin desborde horizontal y sin anidar controles interactivos

## 7. Navegación, textos y documentación

- [x] 7.1 Renombrar el namespace `favorites` a `collection` y la clave `header.favorites` a `header.collection` en `src/locales/es.json` y `en.json`; añadir textos de resumen, vista y fechas, y verificar que no queda «favoritos» referido a álbumes con `grep -rni "favorit" src/locales`
- [x] 7.2 Reordenar `navItems` en `src/components/Header.tsx` a Inicio, Buscar, Colección, Artistas, Novedades, Amigos, Historial, cambiar el icono a `Library` y añadir la redirección permanente `/favorites` → `/collection` en `next.config.ts`; verificar escritorio, cajón móvil y `/favorites?tab=listen-later`
- [ ] 7.3 Actualizar `bruno/kanso-api/02-collection` con los nuevos endpoints y nombres, y comprobar que `02-collection`, `03-listen-later` y `06-recommendations` pasan completos
- [x] 7.4 Actualizar `README.md` y `docs/ARCHITECTURE.md` con el nombre «Colección», la ruta `/api/collection`, `users/{uid}/collection` y el script de migración; verificar que los comandos documentados existen en `package.json`
- [ ] 7.5 Comprobación final: `npx tsc --noEmit`, `npm run lint`, `npm run build`, Bruno completo y recorrido manual de Inicio, Búsqueda, Colección, Por escuchar, Álbum, Artistas, Novedades, Historial, Amigos y Ajustes en español e inglés
- [x] 7.6 Cierre de restos: `grep -rn "Favorite\|/favorites\|userFavorites\|toggleFavorite\|removeFavorite\|users/.*favorites" src scripts docs README.md` no debe devolver referencias de colección, solo favoritos de artistas; confirmar también que no quedan `fetch`/`authFetch` en páginas ni `adminDb` en las rutas de colección y recomendaciones

## Workflow follow-up

- Archivar el cambio cuando se cumplan los requisitos de revisión del proyecto y la migración esté verificada.
- Sincronizar los specs principales desde los deltas (`album-collection`, `listen-later`, `navigation`).
- Verificar el resultado archivado y que `refactor-frontend-architecture` refleja las tareas absorbidas.
