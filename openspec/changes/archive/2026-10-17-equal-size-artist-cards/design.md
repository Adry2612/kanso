# Design

## Context

Ver `proposal.md` — Why. `ArtistCard` renderiza imagen circular, nombre, una línea de géneros **condicional** (`{artist.genres?.length > 0 && ...}`) y, si se pasa `onToggleFavorite`, un botón de seguir. La rejilla la forman `Stagger`/`StaggerItem` (grid). Al ser los géneros opcionales y no fijar altura, las tarjetas miden distinto.

## Goals / Non-Goals

**Goals:**

- Altura idéntica en todas las tarjetas de la rejilla.
- Botón de seguir alineado al pie en todas.

**Non-Goals:**

- Cambiar la información mostrada.

## Decisions

### 1. Celda y tarjeta a altura completa

`StaggerItem` pasa a tener `className="h-full"` y la tarjeta (`article`) `h-full` con `flex flex-col` y `justify-between`, de modo que la acción queda abajo y todas las celdas igualan la más alta.

### 2. Línea de géneros reservada siempre

La línea de géneros se renderiza siempre, con `min-h` fijo: muestra los géneros cuando existen y queda vacía cuando no. Así el bloque imagen + nombre + géneros ocupa exactamente lo mismo en todas las tarjetas.

**Alternativas consideradas**

- _Altura fija en px_: rígida ante cambios de tipografía. Descartada.
- _Ocultar el botón cuando no hay favorito_: cambia funcionalidad. Descartada.

## Risks / Trade-offs

- [Nombres muy largos en una línea] → se mantiene `truncate`, sin saltos de línea.

## Migration Plan

No requiere migración. Despliegue normal.
