# Design

## Context

- La colección guarda `tags: { category, value }[]`; las categorías vivas son `idioma` y `género` (`src/lib/tags.ts`).
- `getCollectionGenres` (`src/utils/collection.ts`) ya une `album.genres` con las etiquetas de género.
- `FilterModal` ofrece una lista fija de géneros (rock, pop, jazz, electronic, classical, hip-hop).
- `getArtist(id)` (`src/services/server/spotify.ts`) consulta Spotify; su respuesta incluye `genres` a nivel de artista.
- La recomendación acepta `format` y `tags`; `matchesTags` compara `categoría:valor`.
- El idioma es una etiqueta manual: Spotify no expone el idioma del álbum.

## Goals / Non-Goals

**Goals:**

- Derivar una rama principal de género desde los artistas de Spotify y proponerla editable al guardar.
- Usar esa rama en los filtros de colección y recomendación.
- No bloquear el guardado si Spotify falla.

**Non-Goals:**

- Derivar el idioma: sigue siendo manual.
- Cambiar el modelo de etiquetas ni migrar datos existentes.
- Cubrir todos los subgéneros: solo la rama principal.

## Decisions

### 1. Ramas canónicas y mapeo

Nuevo `src/utils/genres.ts`:

```ts
export const GENRE_BRANCHES = [
  "pop", "rock", "hip-hop", "metal", "r&b", "jazz", "electronic",
  "classical", "indie", "folk", "reggaeton", "soul", "punk",
  "country", "ambient", "blues",
] as const;
export type GenreBranch = (typeof GENRE_BRANCHES)[number];

export function mapSpotifyGenreToBranch(genre: string): GenreBranch | null;
export function mapSpotifyGenres(genres: string[]): GenreBranch[];
```

Reglas ordenadas por especificidad (una coincidencia gana la primera):

| Rama | Coincide con |
|---|---|
| hip-hop | `hip hop`, `rap`, `trap`, `drill`, `grime`, `boom bap` |
| metal | `metal`, `metalcore`, `deathcore`, `grindcore` |
| punk | `punk`, `hardcore`, `emo`, `post-hardcore` |
| r&b | `r&b`, `rnb`, `contemporary r&b`, `neo soul` |
| soul | `soul`, `motown` |
| jazz | `jazz`, `bebop`, `swing` |
| classical | `classical`, `orchestra`, `opera`, `baroque` |
| electronic | `electronic`, `edm`, `house`, `techno`, `trance`, `dubstep`, `drum and bass`, `dnb` |
| indie | `indie`, `bedroom` |
| rock | `rock`, `grunge`, `shoegaze`, `alternative` |
| pop | `pop` |
| folk | `folk`, `singer-songwriter`, `acoustic` |
| country | `country`, `americana` |
| reggaeton | `reggaeton`, `reggaetón`, `dembow`, `latin` |
| ambient | `ambient`, `chillout` |
| blues | `blues` |

Las coincidencias se evalúan en ese orden, así `latin hip hop` cae en `hip-hop` y `powermetal`/`metalcore` en `metal`. Los géneros sin coincidencia se ignoran. `mapSpotifyGenres` deduplica y devuelve en el orden canónico.

- **Alternativa descartada:** guardar el género crudo de Spotify. Es demasiado granular y rompe los filtros.

### 2. Derivación desde los artistas

`deriveAlbumGenreBranches(album)` consulta `getArtist` para cada artista del álbum, con caché en memoria por artista (24 h) y `Promise.allSettled`; une los géneros y aplica el mapeo. Se expone `GET /api/albumGenres?albumId=` (autenticado) que devuelve `{ genres: GenreBranch[] }`; el cliente lo consume con `getAlbumGenres`.

- Si un artista falla o no tiene géneros, se ignora; si fallan todos, `genres` es `[]`.
- Sin dependencias nuevas.

### 3. Relleno previo editable en el guardado

Al abrir el modal de guardado, si el álbum no trae ya una etiqueta de categoría `género`, se piden las ramas derivadas y se añaden como etiquetas `{ category: "género", value: rama }`. El `TagEditor` existente permite quitarlas o añadir otras; se guarda la elección final. No hay migración: los álbumes ya guardados conservan sus etiquetas y reciben el relleno la próxima vez que se editen.

- **Alternativa descartada:** guardar el género en el catálogo global del álbum. Impide que cada persona lo edite o lo quite.

### 4. Filtros y recomendación

- La colección ya resuelve géneros como `album.genres ∪ etiquetas de género`; con el género como etiqueta, el filtro funciona sin cambiar el modelo. Se amplía la lista de `FilterModal` con las ramas canónicas (al menos `metal`, `r&b`, `indie`, `reggaeton`, etc.).
- La recomendación ya filtra por etiquetas (`matchesTags`); una etiqueta `género:hip-hop` limita los candidatos. El selector de etiquetas del inicio ya muestra las de la colección, así que la rama derivada es seleccionable sin un control nuevo.

### 5. Idioma

Sin cambios: sigue siendo una etiqueta `idioma` manual. No se inventa una inferencia.

## Risks / Trade-offs

- **Género de artista amplio o ausente** → La rama es editable y el guardado no se bloquea.
- **Límite de peticiones a Spotify** → Caché por artista y consultas en paralelo acotadas.
- **Mapeo subjetivo** → Reglas puras con tests y ejemplos del enunciado.
- **Etiquetas duplicadas** → Se reutiliza `uniqueTags`/`tagKey` para no duplicar.
- **Sin migración** → Los álbumes antiguos no tienen rama hasta que se editen; es aceptable y se documenta.

## Migration Plan

Sin migración de datos:

1. Añadir `genres.ts` y sus tests.
2. Añadir la derivación, el endpoint y el cliente.
3. Rellenar el género en el modal de guardado y ampliar la lista del filtro.
4. Verificar colección y recomendación; rollback revirtiendo el commit.
