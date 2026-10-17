# Proposal

## Why

En la rejilla de artistas, las tarjetas tienen alturas distintas según si el artista tiene géneros o no, y según el largo del nombre. El resultado es una cuadrícula irregular y desalineada.

## What Changes

- Hacer que todas las tarjetas de artista (tanto en "Tus artistas" como en los resultados) tengan la misma altura, con la acción de seguir siempre alineada abajo y una línea reservada para los géneros.

Fuera de alcance: cambiar el contenido de la tarjeta o añadir datos nuevos.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- Ninguna (cambio puramente de presentación).

## Impact

- `src/components/ArtistCard.tsx` (altura uniforme y estructura fija).
- `src/app/artists/page.tsx` (celdas de la rejilla a altura completa).
- Sin cambios de API, datos ni dependencias.
