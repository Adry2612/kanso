# Proposal

## Why

La búsqueda global mezcla resultados de álbumes y artistas, pero la interfaz solo pinta los álbumes. Cuando la consulta es el nombre de un artista, Spotify devuelve discos del artista junto a coincidencias parciales de título, recopilatorios, tributos y colaboraciones, y el artista exacto —que sí viene en la respuesta— nunca se muestra. El resultado es una lista que parece poco fiable aunque el proveedor haya encontrado al artista correcto.

## What Changes

- Mostrar en `/search` una sección de artistas con imagen y nombre; cada artista enlaza a su ficha existente en `/artists/[id]`.
- Detectar en el servidor una coincidencia exacta entre la consulta y un artista devuelto por Spotify, ignorando mayúsculas, tildes y espacios sobrantes.
- Cuando haya coincidencia exacta:
  - colocar ese artista primero en la lista de artistas;
  - sustituir los álbumes genéricos por los álbumes y singles del artista exacto;
  - excluir recopilatorios y resultados que solo coinciden por título;
  - mantener el resto del comportamiento de búsqueda cuando no haya coincidencia exacta.
- Ajustar el estado sin resultados para distinguir “no hay álbumes” de “no hay nada”, teniendo en cuenta que puede haber artistas aunque no haya álbumes.
- Mantener el contrato `GET /api/search` (`albums` y `artists`); solo cambia la selección y el orden de los elementos devueltos.

**Fuera de alcance**: cambiar el buscador de `/artists`, añadir paginación a la búsqueda, modificar el flujo de guardado o cambiar la ficha de artista.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `album-search`: la búsqueda global pasa a mostrar artistas y a priorizar la discografía del artista cuando la consulta coincide exactamente con su nombre, descartando coincidencias solo por título y recopilatorios.

## Impact

- `src/app/api/search/route.ts` y `src/services/server/spotify.ts`: detección de artista y consulta específica de sus álbumes.
- `src/utils/searchTerms.ts` o una utilidad pura equivalente: normalización y selección del artista exacto.
- `src/app/search/page.tsx` y un componente presentacional de la misma carpeta: sección de artistas y estado sin álbumes.
- `src/hooks/client/useAlbumSearch.ts`: sin cambios de contrato; seguirá exponiendo la respuesta tipada.
- `src/locales/es.json` y `src/locales/en.json`: nuevas etiquetas de la sección de artistas.
- Dependencia de secuencia: se implementará como cambio separado en la misma rama de trabajo, después de archivar `report-api-errors`, para no mezclar la revisión de errores de API con un cambio de comportamiento de búsqueda.
