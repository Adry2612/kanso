# Tasks

> Las tareas 7.1, 7.2, 7.4 y 7.7 quedan absorbidas por el cambio `collection-experience`. No se marcan aquí: su seguimiento vive en ese cambio.

## 1. Guardarraíles, estructura y tipos base

> Bloqueos confirmados: `report-api-errors` sigue activo y bloquea las tareas que modifican `src/app/api/**/route.ts` (5.4, 6.2, 7.2, 7.4). `fix-mobile-viewport` ya está archivado: Header, ModalShell y los modales (4.4, 4.5, 8.4) están completados.

- [x] 1.1 Confirmar el estado de `report-api-errors` y `fix-mobile-viewport` con `openspec list --json`; si siguen activos, dejar constancia de qué fases quedan bloqueadas y no tocar sus archivos
- [x] 1.2 Crear `src/services/client/` y `src/services/server/` con un `README.md` que describa la dirección de dependencias; verificar que las carpetas existen y que el documento coincide con `design.md`
- [x] 1.3 Unificar el alias de TypeScript: eliminar `@/services/*` y usar solo `@/*`; actualizar los imports afectados y verificar con `rg "@/services/"` y `npx tsc --noEmit`
- [x] 1.4 Mover los tipos compartidos de `models/album.ts`, `src/types/spotify.ts`, `src/lib/api/artists.ts`, `src/lib/friendLibrary.ts` y `src/lib/activityRecommendations.ts` a `src/types/*`, dejando re-exports temporales; verificar con `npx tsc --noEmit`
- [x] 1.5 Añadir `import "server-only"` a `src/lib/firebaseAdmin.ts`, `src/lib/apiAuth.ts`, `src/lib/avatar.ts` y a los futuros servicios de servidor; verificar con `npm run build` que ningún cliente los importa
- [x] 1.6 Configurar reglas `no-restricted-imports` en `eslint.config.mjs` para impedir que `app/**/page.tsx`, `components/**` y `hooks/**` importen `services/server/**`, `firebase-admin` o `lib/apiAuth`; verificar con `npm run lint`
- [x] 1.7 Poner `@typescript-eslint/no-explicit-any` en `error` para `src/services/**`, `src/hooks/**`, `src/utils/**` y `src/types/**`; verificar con `npm run lint` y corregir las excepciones necesarias
- [x] 1.8 Eliminar directorios vacíos (`src/app/api/analyzeAlbumOptimalActivity`, `getRecomendation`, `getRecommendationsByActivity`, `src/app/recommendation/result` y `src/config` si sigue vacío); verificar con `find src -type d -empty`
- [x] 1.9 Escribir `docs/ARCHITECTURE.md` con la tabla de capas, ejemplos de imports permitidos y el flujo para añadir una pantalla nueva; verificar que los comandos y rutas documentados existen

## 2. Frontera crítica cliente/servidor de Spotify

- [x] 2.1 Mover `services/spotify.ts` a `src/services/server/spotify.ts`, añadir `server-only` y actualizar los imports de las rutas; verificar con `rg "services/spotify"` y `npm run build`
- [x] 2.2 Crear `src/app/api/albums/[albumId]/route.ts` como adaptador de servidor para el detalle, reutilizando el servicio de Spotify y conservando el shape actual; verificar la respuesta con `curl` o Bruno
- [x] 2.3 Crear `src/services/client/albums.ts` con `getAlbum(albumId)` tipado que llame a la ruta interna; verificar que el servicio no importa `services/server` ni `firebase-admin`
- [x] 2.4 Sustituir el import de `services/spotify` en `src/app/albums/[albumId]/page.tsx` por el servicio de cliente, manteniendo `useSuspenseQuery` y la hidratación; verificar que la página carga y que el bundle de cliente no incluye el servicio de servidor
- [x] 2.5 Revisar `src/app/albums/[albumId]/layout.tsx` y unificar la ruta de datos con la nueva ruta/servicio; verificar que no hay dos contratos distintos para el mismo álbum

## 3. Patrón vertical: Favoritos y Por escuchar

- [x] 3.1 Añadir a `src/types/favorites.ts` los tipos `CollectionFavorite`, `CollectionFilters`, `FavoritesTab` y `ListenLaterItem`; verificar que no queda ningún `any` en las props de la página y con `npx tsc --noEmit`
- [x] 3.2 Crear `src/services/client/favorites.ts` y ampliar `src/services/client/listenLater.ts` con operaciones tipadas (`getCollection`, `removeFavorite`, `getListenLater`, etc.); verificar con `npx tsc --noEmit`
- [x] 3.3 Sustituir en `src/app/favorites/page.tsx` los `authFetch`/`fetch` directos por los servicios de cliente; verificar con `rg "authFetch|fetch\\(" src/app/favorites`
- [x] 3.4 Mover a `src/utils/favorites.ts`, `src/utils/listenLater.ts` y `src/utils/tags.ts` los filtros, ordenaciones, agrupaciones, deduplicación de etiquetas y conteo de filtros; verificar con `npx tsc --noEmit` y una comprobación manual de los mismos resultados
- [x] 3.5 Crear `src/hooks/client/useFavoritesPage.ts` con carga, pestañas, búsqueda, filtros, modales, reintento y acciones; verificar que la página solo compone el hook y los componentes
- [x] 3.6 Dividir la vista de Favoritos en componentes presentacionales (`FavoritesHeader`, `FavoritesFilters`, `FavoritesCollectionGrid`, `ListenLaterGrid`, `FavoritesEmptyState`) y verificar que no importan servicios ni contienen cálculos
- [x] 3.7 Verificar el corte vertical: `npx tsc --noEmit`, `npm run lint`, `npm run build`, Bruno de `02-collection` y `03-listen-later`, y matriz manual de pestañas, búsqueda, filtros, orden, vacío y error

## 4. Detalle de álbum y asistente de guardado

- [x] 4.1 Tipar `Album`, `Track`, `TrackArtist` y las respuestas de detalle en `src/types/album.ts`; eliminar los tipos locales de `src/app/albums/[albumId]/page.tsx` y verificar con `npx tsc --noEmit`
- [x] 4.2 Mover a `src/utils/color.ts`, `src/utils/tracklist.ts` y `src/utils/formats.ts` el cálculo de color dominante, la proyección de pistas y la normalización de formatos; verificar los mismos valores con una prueba manual
- [x] 4.3 Crear `src/hooks/client/useAlbumDetail.ts` con la consulta, el estado de colección/pendientes, el color, la tracklist y las acciones; verificar que la página no contiene `useEffect` de carga ni cálculos
- [x] 4.4 Extraer `useSaveAlbumWizard` y `useAlbumCollectionActions`; sustituir los `useFetch` de los pasos del modal por acciones tipadas y verificar guardar, editar, mover a colección, quitar y deshacer
- [x] 4.5 Dividir `SaveAlbumModal` y sus pasos en subcomponentes presentacionales, manteniendo `ModalShell` y el comportamiento de teclado/scroll; verificar que los componentes no llaman a servicios directamente
- [x] 4.6 Verificar el flujo completo: `npx tsc --noEmit`, `npm run lint`, `npm run build`, Bruno de colección/pendientes y matriz manual de los estados ya guardado, pendiente y nuevo

## 5. Búsqueda, artistas, novedades y comunidad

- [x] 5.1 Crear `src/services/client/search.ts`, `src/services/client/community.ts` y `src/services/client/artists.ts` con las llamadas tipadas que hoy están en las páginas; verificar con `rg "fetch\\(|authFetch\\(" src/app/search src/app/page.tsx src/app/artists src/app/releases`
- [x] 5.2 Crear `useAlbumSearch` con debounce y `AbortController`, `useCommunitySuggestions`, `useArtistSearch`, `useArtistDetail`, `useArtistReleases` y `useArtistBackdrop`; verificar que las páginas no contienen los efectos de carga
- [x] 5.3 Mover a `src/utils/searchTerms.ts`, `src/utils/releases.ts` y `src/utils/artists.ts` la normalización de términos, agrupación por mes, etiquetas de tipo y proyecciones; verificar con `npx tsc --noEmit`
- [ ] 5.4 Adelgazar las rutas de Spotify (`search`, `searchArtists`, `getArtist`, `getArtistAlbums`, `getAlbumTracklist`, `artistReleases`) para que solo autentiquen/validen y llamen a `services/server`; verificar que las respuestas no cambian con Bruno
- [x] 5.5 Refactorizar `src/app/search/page.tsx`, `src/app/page.tsx`, `src/app/artists/**`, `src/app/releases/page.tsx` y `ArtistBackdrop` para consumir hooks/componentes; verificar que cada archivo queda sin `fetch`, sin lógica de agrupación y sin tipos locales duplicados
- [x] 5.6 Verificar búsqueda, sugerencias de comunidad, artistas, novedades y errores con `npx tsc --noEmit`, `npm run lint`, `npm run build` y Bruno de `04-search`, `05-community` y `07-artists`

## 6. Amigos y biblioteca compartida

- [x] 6.1 Mover `src/lib/friends.ts` a `src/services/server/friends.ts` y `src/lib/friendLibrary.ts` a `src/services/server/friendLibrary.ts`, con `server-only` y tipos en `src/types/friends.ts`; verificar con `npx tsc --noEmit`
- [ ] 6.2 Adelgazar las rutas `src/app/api/friends/**` y `publicProfile` para que usen los servicios, compartiendo `personFromData`/`loadPeople`; verificar que las respuestas y los códigos 401/403/404 no cambian con Bruno
- [x] 6.3 Crear/ampliar `src/services/client/friends.ts` con DTOs tipados y sin importar tipos de módulos de servidor; verificar con `rg "services/server" src/services/client`
- [x] 6.4 Crear `useFriendsPage`, `useFriendSharing`, `useFriendLibrary`, `usePublicProfile` y `useFriendRequestPolling`; verificar que las páginas no contienen las acciones asíncronas ni el polling
- [x] 6.5 Mover a `src/utils/friends.ts` la normalización de códigos, el parche optimista de compartición, la resolución de relación y la selección de secciones; verificar con `npx tsc --noEmit`
- [x] 6.6 Dividir las listas de solicitudes/amigos y el contenido del perfil público en componentes presentacionales; verificar que no contienen `useState` de flujo ni llamadas a servicios
- [ ] 6.7 Verificar amigos, solicitudes, biblioteca compartida, perfil público y notificaciones con dos cuentas, Bruno de `08-friends` y `npx tsc --noEmit`, `npm run lint`, `npm run build`

## 7. Colección backend, recomendaciones e inicio/historial

- [ ] 7.1 Crear `services/server/collection` (servicio + repositorio) para `toggleFavorite`, `removeFavorite`, `userFavorites` y `listenLater`, conservando transacciones, idempotencia y exclusividad colección/pendientes; verificar con Bruno y una prueba manual de guardado repetido
- [ ] 7.2 Adelgazar las rutas de colección/pendientes para que solo autentiquen, validen y llamen al servicio; verificar que `rg "adminDb|collection\\(" src/app/api/{toggleFavorite,removeFavorite,userFavorites,listenLater}` no encuentra lógica de datos
- [x] 7.3 Separar `src/lib/activityRecommendations.ts` en `src/utils/recommendations.ts` (scoring/filtros puros) y `services/server/recommendations.ts` (lecturas y orquestación); verificar con `npx tsc --noEmit`
- [ ] 7.4 Adelgazar las rutas de recomendaciones/historial (`getAlbumsByMood`, `getRecommendedAlbumByActivity`, `getRecomendationHistory`, `saveRecomendationHistory`) y verificar con Bruno que las respuestas no cambian
- [x] 7.5 Crear `src/services/client/recommendations.ts` y los hooks `useRecommendation`, `useRecommendationHistory` y `useHomeStart`; verificar que `StartPage`, `RecomendationPage`, `recomendationHistory/page.tsx` y la landing no hacen `fetch`/`authFetch`
- [x] 7.6 Mover a `src/utils/recommendationParams.ts`, `src/utils/history.ts` y `src/utils/dates.ts` la construcción de parámetros, agrupación por fecha, estadísticas y formateo; verificar con `npx tsc --noEmit` y una comprobación manual de los mismos resultados
- [ ] 7.7 Verificar recomendación por emoción/actividad, historial, guardado automático, inicio y landing con `npx tsc --noEmit`, `npm run lint`, `npm run build` y Bruno de `06-recommendations`

## 8. Autenticación, ajustes y Header/providers

- [x] 8.1 Crear `src/services/client/auth.ts` que envuelva Google, invitado, email/contraseña, persistencia y `signOut`; verificar que `login/page.tsx` y `settings/page.tsx` no importan `firebase/auth` directamente
- [x] 8.2 Migrar `src/lib/firebase.js` y `src/lib/firebaseAuth.js` a TypeScript o añadir tipos explícitos; verificar con `npx tsc --noEmit`
- [x] 8.3 Crear `useLoginForm`, `useSettingsPage`, `useAvatarUpload` y `useSignOut`; verificar que las páginas solo componen hooks y componentes
- [x] 8.4 Extraer `useSidebar`, `useFocusTrap` y `useMobileDrawer`; convertir `Header` en presentacional y mantener el comportamiento de foco, Escape y scroll; verificar con `npx tsc --noEmit` y una prueba manual
- [x] 8.5 Revisar `AuthContext` y `ProfileContext` para que solo orquesten providers y deleguen la lógica reutilizable en hooks; verificar que no cambian los estados de sesión ni el perfil
- [ ] 8.6 Verificar login (Google, invitado, email), logout, ajustes, avatar y Header en escritorio/móvil; ejecutar `npx tsc --noEmit`, `npm run lint` y `npm run build`

## 9. Endurecimiento y cierre

- [x] 9.1 Activar `@typescript-eslint/no-explicit-any` como `error` en todo `src/` y eliminar los `eslint-disable` de `any`; verificar con `rg "no-explicit-any" src` y `npm run lint`
- [x] 9.2 Activar `react-hooks/exhaustive-deps` como `error` y eliminar los tres `eslint-disable` existentes corrigiendo las dependencias; verificar con `npm run lint`
- [ ] 9.3 Añadir una comprobación automática de fronteras (script npm o regla ESLint) que falle si una vista importa servicios de servidor o si una ruta usa `adminDb` directamente; verificar provocando un import prohibido temporal y restaurándolo
- [ ] 9.4 Actualizar `docs/ARCHITECTURE.md` y el `README` con la estructura final y el flujo para añadir una pantalla; verificar que los comandos documentados funcionan
- [ ] 9.5 Verificación de integración: `npx tsc --noEmit`, `npm run lint`, `npm run build`, Bruno completo y recorrido manual de Inicio, Búsqueda, Álbum, Favoritos, Por escuchar, Artistas, Novedades, Historial, Amigos y Ajustes
- [ ] 9.6 Revisar que no quedan `fetch`/`authFetch` en `src/app/**/page.tsx` ni `src/components/**`, ni `adminDb()` en `src/app/api/**/route.ts`, ni tipos duplicados de álbum/track/historial; verificar con `rg`

## Workflow follow-up

- Archivar el cambio cuando se cumplan los requisitos de revisión del proyecto.
- Sincronizar los specs principales solo si durante la implementación aparece un cambio de comportamiento; este cambio está planificado como refactor puro.
- Verificar el resultado archivado.
