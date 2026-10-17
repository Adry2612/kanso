# Design

## Context

Ver `proposal.md` — Why. La app ya usa el formato `"categoria:valor"` para las etiquetas en dos sitios: `StartPage` (al construir la URL de recomendación) y `getRecommendedAlbumByActivity` (comparación `requiredTags`). El único sitio que usa un contrato distinto es `POST /api/getAlbumsByMood`, que espera `{ category, subtags }`. Además, `RecomendationPage` desestructura el álbum con un campo `AlbumInfo.spotifyUrl` que nunca existió: el álbum guardado (objeto de Spotify) expone `external_urls.spotify`.

## Goals / Non-Goals

**Goals:**

- Que el filtro por etiquetas de la recomendación por emoción devuelva resultados correctos.
- Que "Escuchar en Spotify" del resultado funcione y resista enlaces ausentes.
- Dejar un único contrato de etiquetas en toda la app.

**Non-Goals:**

- Tocar el formato/filtrado de favoritos (ya funciona en `favoritesHelper`).
- Cambiar el modelo de datos almacenado o migrar datos.
- Cambios de seguridad o rendimiento (changes aparte).

## Decisions

### 1. El contrato de etiquetas es `"categoria:valor"` (string)

`getAlbumsByMood` pasa a aceptar `tags: string[]` con el formato `"categoria:valor"` y compara contra las etiquetas del favorito normalizando a minúsculas por ambos lados (igual que al guardar y que el flujo de actividad). Se elimina la interfaz `TagFilter`/`subtags`.

**Alternativas consideradas**

- _Adoptar `{ category, subtags }` en el cliente_: obligaría a tocar `StartPage`, la recomendación por actividad y los tipos, y aleja el contrato del modelo `FavoriteTag` `{ category, value }` ya usado en toda la app. Descartada.
- _Definir un contrato nuevo `{ category, value }` en el body_: válido, pero el flujo de actividad ya compara strings `"categoria:valor"`; mantener strings evita una conversión extra y dos representaciones.

### 2. Normalización de etiquetas al comparar

La comparación será `album.tags.some(t => `${t.category}:${t.value}`.toLowerCase() === tag.toLowerCase())`. Como el guardado ya normaliza `category` y `value` a minúsculas, la comparación es determinista y no se rompe con mayúsculas.

### 3. Fuente de la URL de Spotify

`RecomendationPage` usará `albumInfo.external_urls?.spotify`. `openSpotify` añadirá una guardia: si la URL no es válida o falta, no lanza excepción (retorna sin abrir) y solo intenta abrir cuando hay URL.

**Alternativas consideradas**

- _Añadir un campo `spotifyUrl` al guardar el álbum_: requeriría migración de datos existentes y mantiene dos nombres para lo mismo. Descartada.
- _Construir la URL a partir del id de Spotify_: `openSpotify` ya deriva el id desde la URL; generar la URL en el cliente duplica una responsabilidad de Spotify. Descartada.

## Risks / Trade-offs

- [Etiquetas antiguas guardadas con mayúsculas] → la comparación baja ambos lados a minúsculas, así que coinciden igualmente.
- [Un álbum sin `external_urls.spotify`] → la guardia de `openSpotify` evita el `TypeError`; la spec acepta que no ocurra nada.
- [El body de `tags` cambia de forma] → es un contrato interno; el único consumidor es `src/lib/api/recomendation.ts`, que se actualiza en el mismo change. Sin consumidores externos.

## Migration Plan

Sin migración de datos. Despliegue normal.
