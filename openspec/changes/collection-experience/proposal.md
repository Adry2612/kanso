# Proposal

## Why

La colección es una de las dos funcionalidades principales de Kanso, pero hoy aparece enterrada en el panel como «Favoritos», con una interfaz que no comparte el lenguaje visual del historial de recomendaciones y con el backend a medio conectar: `src/services/server/collection` existe completo, pero ninguna ruta lo usa y la lógica de Firestore sigue duplicada en `toggleFavorite`, `removeFavorite`, `userFavorites` y `listenLater`. Además, el nombre «favoritos» convive con «colección» en la interfaz, los tipos, las rutas y los documentos de Firestore, lo que hace ambigua la terminología y complica cada cambio.

Es el momento de cerrar la fase 7 del refactor (colección y recomendaciones), dar a la colección el peso que tiene en el producto, unificar su interfaz con la del historial y dejar un único nombre —«Colección»— de la interfaz hasta Firestore.

## What Changes

- **La colección pasa a ser «Colección» en todo el sistema.** Se renombran los textos visibles (ES/EN), la ruta de página (`/favorites` → `/collection`), los tipos (`Favorite*` → `Collection*`), utilidades, hooks, componentes, servicios de cliente y la ruta de Firestore (`users/{uid}/favorites` → `users/{uid}/collection`). Los «favoritos de artistas» no forman parte de este renombrado: siguen siendo seguir/dejar de seguir artistas.
- **Migración de datos segura.** Un script con `firebase-admin` copia los documentos existentes de `favorites` a `collection` de forma idempotente y con modo `--dry-run`; el servidor mantiene una lectura dual temporal para que nada desaparezca durante el despliegue. La lectura dual se retira cuando la migración está verificada.
- **API de colección unificada.** `GET`, `POST` y `DELETE /api/collection` sustituyen a `userFavorites`, `toggleFavorite` y `removeFavorite`, y las rutas pasan a ser adaptadores finos sobre `src/services/server/collection` (fase 7.1/7.2 del refactor). `/api/listenLater` conserva su contrato.
- **Interfaz de colección con paridad respecto al historial.** La página pasa a tener cabecera con resumen (álbumes, artistas, emociones), buscador, conmutador cuadrícula/lista, agrupación por fecha de guardado, tarjetas ricas con emociones y formatos, y filas compactas en vista lista. La pestaña «Por escuchar» usa la misma presentación. Se conservan las pestañas, el orden, los filtros y el asistente de guardado.
- **Componentes de galería compartidos.** Las piezas de presentación del historial (tarjeta, fila, cabecera de grupo, conmutador de vista, resumen y esqueleto) se extraen a componentes reutilizables y el historial pasa a usarlos sin cambiar su aspecto ni su comportamiento.
- **Colección en la navegación principal.** El panel muestra «Colección» en tercera posición, después de Inicio y Buscar, con un icono propio de biblioteca; `/favorites` redirige de forma permanente a `/collection` para no romper marcadores.
- **Rutas de recomendaciones adelgazadas.** `getAlbumsByMood`, `getRecommendedAlbumByActivity`, `getRecomendationHistory` y `saveRecomendationHistory` dejan de contener acceso a Firestore y delegan en `src/services/server/recommendations` (fase 7.4), sin cambiar sus respuestas.

## Capabilities

### New Capabilities

Ninguna. El cambio consolida y renombra capacidades existentes.

### Modified Capabilities

- `album-collection`: nombre y ruta de la colección, ruta de Firestore, migración de datos heredados, listado con resumen y vista cuadrícula/lista, agrupación por fecha de guardado y API de colección unificada.
- `listen-later`: la pestaña «Por escuchar» adopta el mismo listado con vista cuadrícula/lista, resumen y agrupación por fecha de incorporación.
- `navigation`: «Colección» sustituye a «Favoritos», cambia de posición en el panel y la ruta antigua redirige a la nueva.

## Impact

- **Páginas y componentes:** `src/app/favorites/**` → `src/app/collection/**`, `RecomendationHistory` (componentes compartidos), `Header`, `SuccessAlbumModal`, enlaces desde búsqueda e inicio.
- **Hooks:** `useFavoritesPage` → `useCollectionPage`, `useFavoritesFilter` → `useCollectionFilter`, nuevos estados de vista y agrupación.
- **Tipos y utilidades:** `src/types/favorites.ts` → `src/types/collection.ts`, `src/utils/favorites.ts` + `favoritesHelper.ts` → `src/utils/collection.ts`, `src/utils/formats.ts`, `src/utils/listenLater.ts`, `src/utils/dates.ts`.
- **Servicios:** `src/services/client/favorites.ts` → `collection.ts`; `src/services/server/collection/*` conectado y renombrado internamente; `friendLibrary` y `recommendations` leen la ruta nueva.
- **API:** nuevas rutas `src/app/api/collection/route.ts`; se eliminan `userFavorites`, `toggleFavorite` y `removeFavorite`; se adelgazan las cuatro rutas de recomendaciones. Sin cambios en `listenLater`.
- **Firestore:** migración de `users/{uid}/favorites` a `users/{uid}/collection`; nuevo script `scripts/migrate-collection.mjs`; sin cambios en `albums`, `communityAlbums` ni `users/{uid}/artists`.
- **Configuración y documentación:** `next.config.ts` (redirección), `src/locales/es.json` y `en.json`, colección Bruno `02-collection`, `README.md` y `docs/ARCHITECTURE.md`.
- **Coordinación:** absorbe las tareas 7.1, 7.2, 7.4 y 7.7 de `refactor-frontend-architecture`, que quedan cubiertas aquí.

## Fuera de alcance

- Cambiar el comportamiento de recomendaciones, su scoring, su historial o sus pantallas; solo se adelgazan sus rutas.
- Renombrar los favoritos de artistas, sus endpoints (`toggleArtistFavorite`, `userArtists`) o la ruta `users/{uid}/artists`.
- Rediseñar la colección más allá de la paridad visual con el historial.
- Añadir ordenación o filtros nuevos; se conservan los siete órdenes y los filtros actuales.
- Cambiar el contrato de `/api/listenLater`, el asistente de guardado o las reglas de exclusividad colección/pendientes.
- Eliminar la lectura dual antes de verificar la migración; se retira al final del cambio, tras comprobar los recuentos.
