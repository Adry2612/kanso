# Proposal

## Why

Hoy el género y el idioma de un álbum son etiquetas que la persona escribe a mano. Spotify expone los géneros de los artistas, así que podemos derivar una rama principal y ahorrar trabajo, además de mejorar los filtros y las recomendaciones. El idioma no existe en la API de Spotify, así que sigue siendo manual.

## What Changes

- **Género derivado al guardar**: al abrir el guardado de un álbum, el sistema consulta los artistas en Spotify, une sus géneros y los mapea a una rama principal (p. ej. `latin hip hop` o `rap español` → `hip-hop`; `powermetal` o `metalcore` → `metal`). La rama se propone como etiqueta de género **editable**.
- **Idioma manual**: sin cambios; no se deriva de la API.
- **Filtros por rama**: la colección y la recomendación filtran por las ramas canónicas, tratando igual el género derivado y la etiqueta manual.
- **Degradación**: si Spotify no responde, el guardado continúa sin género derivado y la persona puede añadirlo a mano.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `album-collection`: el género se deriva de los artistas de Spotify, se propone como etiqueta editable y los filtros usan ramas canónicas.
- `recommendations`: el filtro de género acepta las ramas derivadas y limita los candidatos a los álbumes que las contienen.

## Impact

- Servidor: `src/services/server/spotify.ts` (géneros de artista) y un nuevo endpoint de géneros por álbum.
- Utilidad nueva: `src/utils/genres.ts` con las ramas y el mapeo.
- Interfaz: modal de guardado (relleno previo editable) y lista de géneros del filtro de colección.
- Datos: se reutilizan las etiquetas `género` existentes; sin migración obligatoria.
- Tests unitarios del mapeo; sin dependencias nuevas.
