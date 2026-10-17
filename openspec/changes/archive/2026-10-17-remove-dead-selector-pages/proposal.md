# Proposal

## Why

Quedan tres componentes selectores de recomendación que ningún módulo importa ni ninguna ruta usa. Son restos de un flujo anterior, ensucian el árbol de `src/app/home/pages/` y hacen dudar sobre cuál es la pantalla real de recomendaciones.

## What Changes

- **Eliminar** `src/app/home/pages/RecomendationSelectorPage.tsx`, `src/app/home/pages/MoodSelectorPage.tsx` y `src/app/home/pages/ActivitySelectorPage.tsx`, verificados sin referencias (solo sus propias definiciones).
- No se toca `src/app/home/mood/page.tsx`, que define su propia función `MoodSelectorPage` (pantalla real y en uso).

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- Ninguna. Es limpieza sin cambio de comportamiento observable; por eso declara `skip_specs: true`.

## Impact

- Archivos eliminados: `src/app/home/pages/RecomendationSelectorPage.tsx`, `MoodSelectorPage.tsx`, `ActivitySelectorPage.tsx`
- Sin cambios de rutas, API ni comportamiento.
