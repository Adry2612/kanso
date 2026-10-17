# Design

## Context

Ver `proposal.md`. Tres componentes sin uso del flujo antiguo de selección de recomendaciones.

## Goals / Non-Goals

**Goals**: eliminar código muerto que confunde el flujo real (inicio → recomendación unificada).

**Non-Goals**: cambiar la navegación o las pantallas en uso.

## Decisions

### 1. Eliminar, no reutilizar
`RecomendationSelectorPage` y `ActivitySelectorPage` solo se referencian a sí mismos. `pages/MoodSelectorPage.tsx` no es la `MoodSelectorPage` de `src/app/home/mood/page.tsx` (esa es otra función local y en uso). Se eliminan los tres archivos.

**Alternativas consideradas**
- *Restylear y mantenerlos*: descartado; nadie los importa y duplican lógica ya viva en otras rutas.

## Risks / Trade-offs

- [Borrar algo que sí se iba a usar] → verificado por búsqueda que no hay imports; el flujo vigente está en `home/page.tsx` (StartPage) y `/recommendation`.

## Migration Plan

No requiere migración.
