# Proposal

## Why

Las etiquetas de idioma y género se guardan hoy como texto libre y mezclan dos vocabularios: el género derivado de Spotify usa claves canónicas (`electronic`) y el que escribe la persona usa la etiqueta traducida (`Electrónica`). El resultado es que filtros y recomendaciones dejan de encontrar álbumes, y el mismo concepto aparece escrito de varias formas. Además, el resultado de una recomendación no comparte la estructura completa del detalle de un álbum de la colección y su estado de carga dibuja la animación de vinilos dentro del hueco de la portada, por lo que parece una portada rota en vez de trabajo en curso.

## What Changes

- **Taxonomía cerrada de etiquetas**: idioma y género pasan a guardarse como claves canónicas —`idioma: es`, `género: electronic`— elegidas de un catálogo, sin texto libre.
- **Un idioma y un género principal por álbum**. El género derivado de Spotify se reduce a una rama principal y se propone preseleccionado; la persona puede cambiarlo dentro del catálogo.
- **Migración de etiquetas existentes** con un script idempotente, `--dry-run` e informe de valores no reconocidos; los valores que no se reconozcan no se borran.
- **Etiquetas traducidas al mostrarlas** en colección, filtros, detalle, inicio, recomendaciones e historial, a partir de la clave canónica.
- **Selección de etiquetas para recomendar** con las mismas claves y nombres traducidos, tanto en la recomendación rápida como en los flujos por emoción y actividad.
- **Resultado de recomendación con la ficha completa**: portada, título, artistas, descripción, acciones y el mismo panel «Mi disco» del detalle (emociones, actividades, formatos y etiquetas), manteniendo Spotify y la valoración como acciones propias.
- **Carga de la recomendación a pantalla completa**: la animación de vinilos se centra en la pantalla con un mensaje que explica que se está calculando la recomendación, en lugar de vivir dentro del hueco de la portada junto a esqueletos.
- **BREAKING (datos)**: cambia la representación de las etiquetas guardadas. Se incluye migración y normalización al leer para no romper datos antiguos.

## Capabilities

### New Capabilities

- `tag-taxonomy`: catálogo canónico de idiomas y géneros, valores únicos por álbum, alias de compatibilidad, etiquetas traducidas y migración de valores antiguos.

### Modified Capabilities

- `album-collection`: el asistente guarda idioma y género mediante selección de catálogo; los filtros y la visualización usan claves canónicas y etiquetas traducidas.
- `recommendations`: la selección de etiquetas usa el catálogo canónico; el resultado adopta la ficha completa con panel de datos guardados y un estado de carga centrado con animación y mensaje.
- `quick-recommendation`: la etiqueta elegida para la recomendación rápida se muestra traducida y se envía como clave canónica.

## Impact

- Nuevo `src/constants/taxonomy.ts` (o ampliación de `src/lib/tags.ts`) con catálogos, alias y helpers de normalización/etiqueta.
- `src/utils/genres.ts` y `src/services/server/genres.ts`: elección del género principal y respuesta `{ main, branches }`.
- `src/app/api/albumGenres/route.ts`, `src/services/client/albums.ts`, `src/hooks/client/useSaveAlbumWizard.ts`.
- `src/components/TagEditor.tsx`, `TagList.tsx`, `SaveAlbumFormatStep.tsx`, `FilterModal.tsx`, filtros activos de colección, inicio y recomendación.
- `src/app/home/pages/RecomendationPage.tsx`, `src/components/album/VinylCrateLoader.tsx`, `AlbumShowcase.tsx` y el nuevo estado de carga.
- `src/services/server/recommendations.ts` y `src/types/recommendations.ts`: formato y etiquetas en el resultado por actividad.
- `scripts/migrate-tags.mjs`, traducciones ES/EN y `docs/TRADUCCIONES.md`.
- Tests de taxonomía, género principal, normalización y filtros; sin dependencias nuevas.
