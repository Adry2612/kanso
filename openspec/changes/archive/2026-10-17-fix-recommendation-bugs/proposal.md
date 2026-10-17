# Proposal

## Why

Dos defectos rompen comportamiento ya especificado en `recommendations`:

1. **El filtro por etiquetas nunca devuelve resultados.** El cliente envía las etiquetas como `"categoria:valor"`, pero `POST /api/getAlbumsByMood` las interpreta como objetos `{ category, subtags }`, así que `matchesTagsAndSubtags` descarta todos los álbumes y responde 404 *"No se encontraron álbumes"* en cuanto se selecciona una etiqueta.
2. **"Escuchar en Spotify" del resultado revienta.** `RecomendationPage` lee `albumInfo.spotifyUrl`, un campo que no existe en el álbum guardado (el real es `external_urls.spotify`), y `openSpotify(undefined)` lanza `TypeError`.

Ambos incumplen la spec `recommendations` (filtros de etiquetas y acceso a Spotify desde el resultado) y degradan el flujo principal de la app.

## What Changes

- **Unificar el contrato de etiquetas** en la recomendación por emoción: `POST /api/getAlbumsByMood` acepta `tags: string[]` con el formato `"categoria:valor"` (el mismo que ya usan `StartPage` y la recomendación por actividad), y compara contra las etiquetas del favorito normalizando mayúsculas/minúsculas. Se elimina la interfaz `TagFilter`/`subtags` incompatible.
- **Corregir la acción de Spotify** en el resultado de recomendación para usar `albumInfo.external_urls.spotify`.
- **Blindar `openSpotify`** para que una URL ausente o inválida no lance excepción.

Fuera de alcance: la selección de emoción perdida en `/home/mood` (solo afecta a rutas huérfanas que se eliminan en un change aparte), la fecha literal del inicio (se aborda en el change de i18n) y cualquier cambio de seguridad o rendimiento.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `recommendations`: el filtrado por etiquetas de la recomendación por emoción debe respetarse de verdad, y abrir el álbum recomendado en Spotify desde el resultado debe funcionar.

## Impact

- `src/app/api/getAlbumsByMood/route.ts` (contrato y filtrado de etiquetas)
- `src/lib/api/recomendation.ts` (tipo del parámetro `tags`)
- `src/app/home/pages/RecomendationPage.tsx` (URL de Spotify)
- `src/lib/spotifyUtils.ts` (guardia ante URL inválida)
- Sin cambios de API pública ni de datos; sin nuevas dependencias.
