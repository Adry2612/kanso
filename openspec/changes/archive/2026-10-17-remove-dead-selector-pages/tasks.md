# Tasks

## 1. Verificación de ausencia de referencias

- [x] 1.1 Buscar referencias a `RecomendationSelectorPage`, `MoodSelectorPage` y `ActivitySelectorPage` y confirmar que solo aparecen en sus propias definiciones

## 2. Eliminación

- [x] 2.1 Eliminar `src/app/home/pages/RecomendationSelectorPage.tsx`, `src/app/home/pages/MoodSelectorPage.tsx` y `src/app/home/pages/ActivitySelectorPage.tsx` y verificar que `npx tsc --noEmit` y `npm run build` siguen pasando

## 3. Verificación final

- [x] 3.1 Ejecutar `openspec validate remove-dead-selector-pages` y verificar que el change es válido

## Workflow follow-up

- Archivar el change.
