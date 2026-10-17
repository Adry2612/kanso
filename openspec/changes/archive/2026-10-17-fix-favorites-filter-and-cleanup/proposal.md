# Proposal

## Why

Al contrastar el código con las specs base detectamos defectos que incumplen el comportamiento ya especificado: el filtro por género lanza un `ReferenceError`, hay archivos vacíos o sintácticamente inválidos y componentes huérfanos que no se usan. Corregirlos deja la aplicación conforme a las specs y despeja el terreno para el rediseño posterior.

## What Changes

- **Corregir el filtro por género** en `src/utils/favoritesHelper.ts`: la función `matchesGenres` referencia una variable inexistente; debe filtrar por los géneros disponibles del álbum (campo `genres` del documento del álbum y etiquetas de categoría "género") sin lanzar error.
- **Eliminar archivos vacíos o inválidos**: `src/lib/moodActivityMapper.ts` (vacío), `src/hooks/useActivityRecommendations.ts` (vacío), `src/app/api/getRecommendationsByActivity/route.ts` (vacío) y `src/app/api/getRecomendation/route.ts` (truncado y sin uso).
- **Corregir el import faltante** de `SpotifyArtist` en `src/app/api/getAlbumTracklist/route.ts`.
- **Eliminar componentes huérfanos** nunca renderizados: `ConfirmRemoveFavoriteStep.tsx` y `UndoFavoriteModal.tsx` (el flujo real elimina sin confirmación, conforme a la spec `album-collection`).
- **Eliminar exportaciones muertas** de `src/lib/api/recomendation.ts` (`getRecommendationsByActivity`, `getRandomUnseenRecommendationByMood`, `getRandomUnseenRecommendationByActivity`) y los `console.log` de depuración.
- **Corregir errores de tipos preexistentes** que impedían `next build`: `MoodSelector`, `activityRecommendations`, `RecomendationPage`, `AlbumTracklist`.
- **Reescribir** `src/app/recomendation/page.tsx` quitando el JSX inalcanzable y **envolver `useSearchParams()` en `Suspense`** en `/recommendation` y `/login` para que el build de producción complete.
- **Arreglar el lint**: `eslint.config.mjs` mezclaba formato *eslintrc* (`plugins`/`extends` como arrays) dentro de *flat config*; se registra `eslint-plugin-prettier` correctamente, se añade `eslint-config-prettier` y `ignores`. Se corrigen los 4 errores reales (`<a>` → `Link` en `/login`, `@ts-ignore` → `@ts-expect-error` en `I18nContext`) y se aplica `npm run format` para dejar `npm run lint` en 0 errores.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- Ninguna. Este change corrige la implementación para cumplir specs ya vigentes y limpia código muerto; no cambia comportamiento especificado. Por eso declara `skip_specs: true`.

## Impact

- `src/utils/favoritesHelper.ts`
- `src/app/api/getAlbumTracklist/route.ts`
- Archivos eliminados: `src/lib/moodActivityMapper.ts`, `src/hooks/useActivityRecommendations.ts`, `src/app/api/getRecommendationsByActivity/route.ts`, `src/app/api/getRecomendation/route.ts`, `src/app/search/components/SelectedAlbumModal/steps/ConfirmRemoveFavoriteStep.tsx`, `src/app/search/components/SelectedAlbumModal/steps/UndoFavoriteModal.tsx`
- Sin cambios de API pública, dependencias ni datos.
