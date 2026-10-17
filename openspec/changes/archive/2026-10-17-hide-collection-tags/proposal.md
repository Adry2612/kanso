# Proposal

## Why

Las tarjetas de la pantalla de colección muestran hoy las etiquetas personales de cada álbum, lo que añade ruido visual a la rejilla y compite con la portada y el nombre. La persona ha pedido que en la colección no se vean las etiquetas.

## What Changes

- Dejar de renderizar las etiquetas personales en las tarjetas de la colección y retirar la prop `tags` de `AlbumCard` (no la usa ningún otro consumidor).
- Mantener el filtrado por etiquetas y su visualización en el detalle del álbum (no se toca).

Fuera de alcance: la pantalla de detalle, el modal de filtros y el modelo de datos de etiquetas.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `album-collection`: el listado de la colección deja de mostrar las etiquetas personales en las tarjetas.

## Impact

- `src/components/AlbumCard.tsx` (retirada de la prop `tags` y del render de `TagList`)
- `src/app/favorites/page.tsx` (deja de pasar `tags` a las tarjetas)
- Sin cambios de API ni de datos. `TagList` sigue usándose en el detalle del álbum.
