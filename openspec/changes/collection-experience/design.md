# Design

## Context

Ver `proposal.md` — Why. El estado relevante para el diseño es:

- `src/services/server/collection/{index,repository,service}.ts` ya implementa guardado, borrado, listado y pendientes, pero **no lo importa ninguna ruta**; la lógica sigue duplicada en cuatro `route.ts`.
- `src/services/server/recommendations.ts` solo cubre la recomendación por actividad. La recomendación por emoción, el historial y su guardado siguen dentro de sus rutas, y la ruta de actividad duplica la orquestación que ya existe en el servicio.
- El historial de recomendaciones (`src/app/recomendationHistory/page.tsx`) ya tiene la presentación objetivo: resumen, buscador, conmutador cuadrícula/lista, grupos por fecha y tarjetas/filas ricas. La colección usa `AlbumCard` y cabeceras distintas.
- `groupByDate` está acoplado a `providedAt` y al locale `es-ES`; la colección necesita agrupar por `savedAt` y respetar el idioma activo.
- El cliente nunca accede a Firestore: todo pasa por la API con Admin SDK y las reglas deniegan todo. El despliegue es atómico en Vercel.
- `refactor-frontend-architecture` sigue activo y conserva tareas 7.1/7.2/7.4/7.7 pendientes; este cambio las absorbe.

## Goals / Non-Goals

**Goals:**

- Un solo vocabulario «colección» de la interfaz a Firestore, con migración verificable y reversible.
- Una única API de colección sobre el servicio de servidor ya escrito.
- Reutilizar la presentación del historial mediante componentes compartidos, no copiando su marcado.
- Cerrar la fase 7.1/7.2/7.4 del refactor sin cambiar el comportamiento de recomendaciones.

**Non-Goals:**

- Rediseñar el historial, sus datos o su comportamiento; solo se extrae su presentación.
- Tocar favoritos de artistas o la ruta `users/{uid}/artists`.
- Añadir ordenaciones, filtros, paginación o persistencia de la vista entre sesiones.
- Eliminar la ruta antigua de Firestore antes de verificar la migración.

## Decisions

### 1. Nomenclatura única: Colección de extremo a extremo

Se renombra el dominio completo, no solo la etiqueta:

| Actual                                                                               | Nuevo                                                                                        |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `src/app/favorites/**`, `Favorites*`                                                 | `src/app/collection/**`, `Collection*`                                                       |
| `src/types/favorites.ts`                                                             | `src/types/collection.ts`                                                                    |
| `FavoriteAlbum`, `FavoriteFormat`, `FavoriteTag`, `GroupedFavorites`, `FavoritesTab` | `CollectionAlbum`, `CollectionFormat`, `CollectionTag`, `GroupedCollection`, `CollectionTab` |
| `src/utils/favorites.ts`, `favoritesHelper.ts`                                       | `src/utils/collection.ts`                                                                    |
| `useFavoritesPage`, `useFavoritesFilter`                                             | `useCollectionPage`, `useCollectionFilter`                                                   |
| `src/services/client/favorites.ts`                                                   | `src/services/client/collection.ts`                                                          |
| `users/{uid}/favorites`                                                              | `users/{uid}/collection`                                                                     |
| `/favorites`                                                                         | `/collection`                                                                                |
| `GET /api/userFavorites`                                                             | `GET /api/collection`                                                                        |
| `POST /api/toggleFavorite`                                                           | `POST /api/collection`                                                                       |
| `DELETE /api/removeFavorite`                                                         | `DELETE /api/collection?albumId=<spotifyId>`                                                 |

Los favoritos de artistas (`toggleArtistFavorite`, `userArtists`, `users/{uid}/artists`) quedan intactos: significan «seguir», no «coleccionar». **Alternativa descartada:** renombrar solo textos visibles; deja dos nombres para el mismo dominio y no cumple la petición de renombrar también lo interno.

La ruta antigua de página se conserva como redirección permanente en `next.config.ts` (`/favorites` → `/collection`, con query incluida). No se mantienen alias de API: el despliegue es atómico y solo una petición en vuelo durante el cambio podría fallar; añadir rutas duplicadas perpetúa justo la ambigüedad que se elimina.

### 2. Una sola API de colección sobre el servicio existente

`src/app/api/collection/route.ts` expone `GET`, `POST` y `DELETE` como adaptadores finos:

1. Autenticar y derivar `uid` del token.
2. Validar la forma de la petición.
3. Llamar a `services/server/collection`.
4. Traducir `CollectionApiError` a su estado HTTP y mapear errores inesperados a 500 con `reportApiError`.

El servicio conserva las transacciones, la idempotencia, la exclusividad colección/pendientes, el catálogo global y el feed de comunidad. La respuesta de listado pasa de `{ favorites }` a `{ collection }`; el resto de formas de respuesta se mantiene para no tocar el asistente ni los avisos.

`/api/listenLater` no cambia de contrato, pero pasa a ser también un adaptador fino del mismo servicio (hoy ya existe la lógica en `service.ts`).

### 3. Migración con copia, lectura dual y retirada verificada

- **Script** `scripts/migrate-collection.mjs` con `firebase-admin`, usando `FIREBASE_SERVICE_ACCOUNT_PATH`:
  - Descubre documentos con `collectionGroup("favorites")`, sin recorrer todos los usuarios.
  - Copia cada documento a `users/{uid}/collection/{docId}` conservando todos los campos; rellena `addedAt`/`savedAt` si faltan.
  - `--dry-run` informa del número de documentos por usuario sin escribir; `--delete-source` borra el origen solo tras copiar; `--user <uid>` limita la ejecución.
  - Es idempotente: si el destino ya existe, no lo sobrescribe y reporta el conflicto; nunca borra en ese caso.
  - Imprime un resumen con copiados, omitidos, conflictos y errores.
- **Lectura dual** en `src/services/server/collection/legacy.ts`: lee la ruta nueva y la antigua y combina por id de documento, con la nueva ganando. Se usa desde el repositorio de colección, la biblioteca compartida y las recomendaciones, para que las tres vean lo mismo durante la transición.
- **Escrituras** siempre en la ruta nueva; al guardar o borrar se elimina también la copia antigua del mismo álbum para que no reaparezca.
- La lectura dual se retira al final del cambio, una vez comparados los recuentos y comprobados los flujos. **Alternativas descartadas:** migración perezosa (deja código heredado para siempre) y big-bang sin lectura dual (pierde documentos si algo falla entre el despliegue y el script).

### 4. Presentación compartida con el historial

Se extraen a `src/components/gallery/` las primitivas que hoy solo existen dentro del historial:

- `GalleryCard` (portada, degradado, insignia de tiempo, hasta dos emociones, formatos, acción de Spotify).
- `GalleryRow` (fila compacta equivalente).
- `GalleryGroupHeader` (punto, etiqueta de fecha y recuento).
- `GalleryViewToggle` (cuadrícula/lista con etiqueta accesible).
- `GalleryStats` (recuento con icono).
- `GallerySkeleton` (esqueleto de cuadrícula y de lista).

El historial se refactoriza para usarlas sin cambiar su aspecto ni su comportamiento. La colección las usa con datos propios. **Alternativa descartada:** duplicar el marcado del historial en la colección; divergiría al primer retoque visual.

### 5. Agrupación: fecha por defecto, ordenación cuando se pide

- Sin ordenación, «más recientes» o «más antiguos»: grupos por fecha de guardado (`savedAt`), con el mismo formato de fecha largo localizado que el historial. «Más recientes» ordena grupos e ítems de más nuevo a más antiguo; «más antiguos», al revés.
- Ordenación por artista, nombre o año: se mantiene la agrupación actual por artista, letra o año, y el orden dentro del grupo que ya define `utils/favorites.ts`.
- Pendientes: siempre agrupados por fecha de incorporación, del más reciente al más antiguo.
- `groupByDate` pasa a aceptar un accesor de fecha y el locale activo; el historial lo usa con `providedAt`. Esto corrige de paso que las fechas del historial salgan siempre en español.

### 6. Estado y composición de la página

`useCollectionPage` concentra carga, pestañas, búsqueda, filtros, orden, modales y acciones, y añade `view` (`grid` | `list`) compartida entre pestañas. `useCollectionFilter` deriva la colección filtrada, ordenada y agrupada. La página solo compone:

```
CollectionHeader        eyebrow + título + subtítulo + resumen + ordenar/filtrar
CollectionTabs          Colección | Por escuchar
CollectionToolbar       buscador + limpiar + conmutador de vista
CollectionMoodChips     solo en Colección
CollectionActiveFilters solo en Colección
GalleryGroupHeader + GalleryCard/GalleryRow
CollectionEmptyState / ErrorState
```

La vista se mantiene al cambiar de pestaña mientras la página sigue montada; no se persiste entre visitas. Los filtros de colección se ocultan en pendientes, pero la búsqueda y la vista se comparten.

### 7. Navegación y textos

- `navItems` queda: Inicio, Buscar, Colección, Artistas, Novedades, Amigos, Historial. El icono de Colección pasa de `Heart` a `Library`.
- El namespace de traducciones `favorites` pasa a `collection`; la clave `header.favorites` pasa a `header.collection`. ES: «Colección», «Mi colección»; EN: «Collection», «My collection». Se eliminan las apariciones de «favoritos» referidas a álbumes en nav, títulos, vacíos, avisos y confirmaciones. «Favoritos de artistas» conserva su lenguaje de seguir/dejar de seguir.
- Las fechas de grupo usan `Intl.DateTimeFormat` con el locale de `I18nContext`, no `es-ES` fijo.

### 8. Fase 7 de recomendaciones

`services/server/recommendations.ts` se amplía con `recommendByMood`, `listRecommendationHistory` y `saveRecommendationHistory`; `recommendByActivity` pasa a ser la única implementación de la actividad. Las cuatro rutas quedan en autenticar, validar, llamar al servicio y mapear `RecommendationApiError`, conservando estados y respuestas (incluido el 404 de «sin coincidencias»). No se renombran sus endpoints ni su comportamiento; el objetivo es solo sacar Firestore de las rutas.

## Risks / Trade-offs

- **[Pérdida de datos en la migración]** → copia antes de borrar, `--dry-run`, no sobrescribir destinos existentes, lectura dual combinada y comparación de recuentos antes de retirar el fallback.
- **[Migración parcial]** → la lectura dual combina ambas rutas por id; la ruta nueva gana, así que un documento migrado nunca retrocede.
- **[Clientes con la página abierta durante el despliegue]** → despliegue atómico, redirección de `/favorites` y ventana de migración corta; se acepta que una acción en vuelo pueda fallar y reintentarse.
- **[Renombrado incompleto por tipos compartidos]** → `tsc --noEmit`, `rg` de «favorit» y reglas ESLint de fronteras antes de cerrar; el compilador detecta los tipos, el grep detecta textos y rutas.
- **[Conflicto con `refactor-frontend-architecture`]** → absorber 7.1/7.2/7.4/7.7 y dejar constancia en su `tasks.md`; no tocar sus demás fases.
- **[Pérdida de accesibilidad al añadir overlays y botones]** → reutilizar el patrón enlace superpuesto + botón con `z-index` del historial y revisar foco, teclado y etiquetas.
- **[Ordenación confusa con grupos por fecha]** → reglas explícitas por ordenación y prueba manual de las siete combinaciones.
- **[Cambio de forma `{ favorites }` → `{ collection }`]** → actualizar servicio cliente, Bruno y cualquier consumidor en el mismo corte; `tsc` y Bruno lo verifican.

## Migration Plan

1. Desplegar el código con la ruta nueva, la lectura dual y la redirección; la colección sigue funcionando con datos antiguos.
2. Ejecutar `npm run migrate:collection -- --dry-run` y revisar el resumen por usuario.
3. Ejecutar la migración real; repetir hasta que no queden conflictos ni errores.
4. Verificar recuentos origen/destino, abrir la colección con una cuenta migrada y pasar Bruno de `02-collection`, `03-listen-later` y `06-recommendations`.
5. Retirar la lectura dual y las constantes heredadas; dejar el script documentado para referencia.
6. **Rollback:** mientras el origen no se haya borrado, revertir el despliegue vuelve a leer `favorites`; si ya se borró, ejecutar el script en sentido inverso (`collection` → `favorites`) antes de revertir.

## Open Questions

Ninguna. El volumen de datos de producción se desconoce, pero el `--dry-run` lo revela antes de escribir y no cambia el diseño.
