# Design

## Context

Ver `proposal.md` para la motivación y `specs/` para el contrato. Estado actual relevante:

- La colección guarda `tags: { category, value }[]`. `normalizeTagCategory` unifica `idioma`/`language` y `género`/`genero`/`genre`; `tagKey` compara en minúsculas.
- `TAG_SUGGESTIONS` (`src/lib/tags.ts`) ofrece valores traducidos según la interfaz y `TagEditor` permite además texto libre con `customPlaceholder`.
- El género derivado de Spotify se guarda como clave canónica (`electronic`), mientras que el manual se guarda como etiqueta traducida (`Electrónica`). `getCollectionGenres` compara en minúsculas, así que ambos vocabularios no coinciden.
- `FilterModal` pinta las 16 ramas canónicas y, por separado, «Tus etiquetas», que repite géneros e idiomas.
- `derive-genre-from-spotify` está completo pero sin archivar: añade requisitos de género derivado y filtro por rama que este cambio refina.
- `AlbumShowcase` ya es la ficha compartida. El detalle le pasa un `aside` con emociones, actividades, formatos y etiquetas; la recomendación no le pasa `aside` y muestra emociones/actividades en `meta`.
- `MoodRecommendationResponse` incluye `format` y `tags`; `RecommendedAlbum` (vía actividad) no los incluye, aunque el servidor los tiene en la entrada elegida.
- La carga de la recomendación pinta `VinylCrateLoader` dentro del hueco de la portada (`aspect-square max-w-[320px]`) junto a esqueletos de la ficha.
- `VinylCrateLoader` vive en un contenedor `.vinyl-fan` con borde y fondo; no tiene variante sin marco.

## Goals / Non-Goals

**Goals:**

- Un solo vocabulario de idioma y género, independiente del idioma de la interfaz.
- Selectores reutilizables en guardado, filtros y recomendación.
- Paridad real entre el detalle de colección y el resultado de recomendación.
- Carga de recomendación legible, centrada y accesible.

**Non-Goals:**

- Añadir subgéneros, nuevos ejes de etiqueta ni detección automática de idioma.
- Cambiar el ranking, los pesos o la fuente de candidatos.
- Añadir acciones de edición o borrado al resultado de la recomendación.
- Rediseñar el detalle de álbum más allá de extraer su panel.

## Decisions

### 1. Módulo de taxonomía con claves canónicas

Nuevo `src/constants/taxonomy.ts`:

```ts
export const GENRE_KEYS = GENRE_BRANCHES; // reutiliza src/utils/genres.ts
export const LANGUAGE_KEYS = ["es", "en", "fr", "de", "it", "pt", "ja", "ko",
  "ru", "ar", "nl", "sv", "ca", "gl", "eu", "zh", "hi", "tr", "pl", "el"] as const;

export function normalizeGenreValue(value: string): GenreKey | null;
export function normalizeLanguageValue(value: string): LanguageKey | null;
export function canonicalizeTag(tag: CollectionTag): CollectionTag | null;
export function canonicalizeTags(tags: CollectionTag[]): CollectionTag[];
export function tagDisplayLabel(tag, t): string; // traduce la clave
```

- `canonicalizeTags` resuelve alias, normaliza la categoría, elimina duplicados y **conserva como máximo una etiqueta por eje**. Para el género se queda con la primera clave reconocida; para el idioma, igual.
- Las etiquetas de categorías que no son idioma ni género se conservan tal cual para no romper datos históricos.
- Los alias viven en el mismo módulo: `Electrónica`, `electronica`, `Electronic` → `electronic`; `Inglés`, `ingles`, `English` → `en`; `Hip-Hop`, `hip hop`, `Rap` → `hip-hop`.

Etiquetas de traducción nuevas bajo `taxonomy.genres.*` y `taxonomy.languages.*`, independientes de `modal.filter.genres` para que la taxonomía no dependa de un modal.

- **Alternativa descartada:** guardar el texto traducido. Vuelve a atar los datos al idioma de la interfaz y a los alias.

### 2. Género principal derivado

`src/utils/genres.ts` gana `pickMainGenre(artistBranches)`:

1. Cuenta en cuántos artistas del álbum aparece cada rama.
2. Gana la más repetida.
3. Empate: la que aparezca en el artista principal.
4. Empate: orden canónico de `GENRE_BRANCHES`.

`deriveAlbumGenreBranches` sigue devolviendo todas las ramas; se añade `deriveAlbumMainGenre` (o se devuelve `{ main, branches }`) usando la misma caché de artistas. `/api/albumGenres` responde `{ main, branches }` y `getAlbumGenres` se convierte en `getAlbumGenre` con ese contrato. El asistente preselecciona solo `main`.

- **Alternativa descartada:** usar el primer género del primer artista. Spotify no garantiza orden de relevancia y daría resultados menos estables.
- **Coordinación:** `derive-genre-from-spotify` debe archivarse antes de archivar este cambio, o su delta debe fusionarse; este cambio sustituye «varias ramas editables» por «una principal dentro del catálogo».

### 3. Modelo de datos sin cambiar la forma de la etiqueta

Se mantiene `{ category: "género", value: "electronic" }` y `{ category: "idioma", value: "en" }`. No hay colección nueva ni migración de esquema: solo cambia el vocabulario de `value`.

El servidor (`normalizeTags` en `src/services/server/collection/service.ts`) aplica `canonicalizeTags` antes de guardar: descarta valores de idioma/género fuera del catálogo y conserva el resto de categorías. Así una petición manipulada no puede reintroducir texto libre.

- **Alternativa descartada:** un campo estructurado `{ language, genre }` en la entrada. Obliga a migrar datos, API y lectores; la etiqueta canónica ya resuelve el problema.

### 4. Selectores en lugar de `TagEditor`

`SaveAlbumFormatStep` sustituye `TagEditor` por dos bloques:

- **Idioma**: `OptionSelector` de selección única con una opción «Sin idioma» que limpia el valor.
- **Género**: `OptionSelector` de selección única con las 16 ramas, preseleccionando el género principal derivado.

Se usa `selection="single"`, `semantics="buttons"` y el sistema de botones compartido. `TagEditor`, `TAG_SUGGESTIONS` y `customPlaceholder` se retiran si no tienen otros usos. El buscador de `OptionSelector` queda disponible para catálogos largos (idioma), no para texto libre.

- **Alternativa descartada:** mantener el campo libre solo para «otros». Reintroduce el problema que este cambio elimina.

### 5. Filtros canónicos y etiquetas traducidas

`FilterModal`:

- Los géneros siguen en `filters.genres`, comparados por rama canónica.
- Los idiomas se guardan en `filters.tags` como `idioma:<código>`, reutilizando el filtro de etiquetas existente y sin cambiar `CollectionFilters`.
- Se elimina el grupo «Tus etiquetas» para idioma/género; queda un selector de idiomas presentes en la colección y otro de géneros. Las categorías antiguas distintas se conservan en «Otras».

Todas las vistas que hoy pintan `tag.value` (`TagList`, chips de colección, filtros activos, búsqueda, inicio, resumen y panel de explicación) usan `tagDisplayLabel`. `getCollectionGenres` pasa los valores por `normalizeGenreValue` para que `album.genres` crudos también coincidan con las ramas.

- **Alternativa descartada:** añadir `filters.languages` al tipo de filtros. Es más limpio a largo plazo, pero obliga a tocar persistencia y consumidores sin cambiar el comportamiento observable; se puede extraer después.

### 6. Paridad del resultado de recomendación

Se extrae de `src/app/albums/[albumId]/page.tsx` un componente presentacional `AlbumRecordPanel` con las secciones de emociones, actividades, formatos y etiquetas. El detalle le pasa `collectionEntry`; la recomendación le pasa los datos del álbum recomendado.

Para que la recomendación tenga formatos y etiquetas, `RecommendedAlbum` gana `format?: string | string[]` y `tags?: { category?: string; value?: string }[]`; `computeActivityRecommendations` los rellena desde la entrada elegida. La respuesta por emoción ya los incluye.

`RecomendationPage` deja de pasar `meta` (emociones y actividades se mueven al `aside`) y pasa `aside={<AlbumRecordPanel … />}`. Mantiene Spotify y `RecommendationFeedback` como acciones. Así la ficha, el ancho del tracklist y el panel coinciden con el detalle.

- **Alternativa descartada:** duplicar el marcado del aside. Volvería a divergir con el tiempo.

### 7. Carga a pantalla completa

Nuevo componente `RecommendationLoading` (o bloque dentro de `RecomendationPage`) con:

```tsx
<main className="kanso-main min-h-screen">
  <div role="status" aria-live="polite" aria-busy="true"
       className="flex min-h-[70vh] flex-col items-center justify-center text-center">
    <span className="sr-only">{t("loading")}</span>
    <VinylCrateLoader variant="bare" className="h-56 w-56" />
    <h1>{t("loadingTitle")}</h1>
    <p>{t("loadingDescription")}</p>
  </div>
</main>
```

`VinylCrateLoader` gana `variant?: "framed" | "bare"`: `bare` elimina borde, fondo y recorte, y permite un tamaño mayor. La animación sigue usando transformaciones y respeta `useReducedMotion`. Se eliminan los esqueletos de portada, título y tracklist del estado de carga; el mensaje cambia según emoción o actividad si se quiere, pero el estado es el mismo.

Textos nuevos en `recommendation.loading.title` y `recommendation.loading.description`.

- **Alternativa descartada:** mantener el esqueleto y solo mover la animación. El usuario pidió explícitamente una pantalla centrada con mensaje, no una ficha fantasma.

### 8. Migración

`scripts/migrate-tags.mjs` con `firebase-admin`:

- `db.collectionGroup("collection")` para cubrir todos los usuarios.
- `--dry-run`, `--user <uid>`, informe por consola y resumen final.
- Por documento: `canonicalizeTags`, cuenta de cambios, valores no reconocidos y conflictos de múltiples géneros/idiomas (se queda el primero y se reporta).
- No borra entradas no reconocidas.
- Idempotente: un segundo pase no encuentra cambios.

Antes de ejecutar: exportar o hacer copia de `users/*/collection` y revisar el informe del dry-run. El rollback de código no corrompe los datos: el código anterior mostraría las claves canónicas como texto.

## Risks / Trade-offs

- **Se pierde matiz al quedarse con un género** → El catálogo cerrado es la decisión de producto; se puede ampliar el catálogo sin cambiar el modelo.
- **La migración puede dejar valores raros** → No se borran, se reportan; el dry-run permite revisarlos antes.
- **Etiquetas antiguas no canónicas en la UI** → `tagDisplayLabel` las muestra como están y `canonicalizeTags` las ignora al guardar; los filtros no las ofrecen.
- **El panel «Mi disco» en la recomendación añade ruido visual** → Solo se muestran secciones con datos y el resultado mantiene el foco en Spotify y la valoración.
- **Cambiar `RecommendedAlbum` puede romper consumidores** → Los campos nuevos son opcionales y el servidor ya devolvía los datos por emoción.
- **La animación a pantalla completa puede tardar en montar** → Es transformación CSS/Framer sin carga de imágenes; el estado se anuncia de inmediato.
- **`derive-genre-from-spotify` sin archivar** → Archivar primero o fusionar su delta; si no, quedarían dos requisitos de derivación con matices distintos.

## Migration Plan

1. Añadir `taxonomy.ts`, alias y tests.
2. Aplicar `canonicalizeTags` en el servidor y en la lectura de la colección.
3. Cambiar la derivación a género principal y el contrato del endpoint.
4. Sustituir `TagEditor` por selectores y traducir etiquetas en todas las vistas.
5. Añadir el panel de datos a la recomendación y el estado de carga centrado.
6. Ejecutar `node scripts/migrate-tags.mjs --dry-run`, revisar el informe y ejecutar la migración.
7. Verificar guardado, edición, filtros, recomendación y migración; desplegar.

Rollback: revertir el despliegue. Los datos canónicos siguen siendo legibles como texto; si hiciera falta volver a las etiquetas traducidas, el script puede ampliarse con un modo inverso, pero no es necesario para operar.

## Open Questions

Ninguna que cambie el alcance; el catálogo de idiomas puede ampliarse después sin tocar el modelo.
