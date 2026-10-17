# Tasks

## 1. Filtro por género

- [x] 1.1 Corregir `matchesGenres` en `src/utils/favoritesHelper.ts` para usar el origen de géneros decidido (campo `genres` del álbum + etiquetas de categoría género) y verificar con un favorito de prueba que activar un filtro de género no lanza `ReferenceError` y devuelve los álbumes correctos
- [x] 1.2 Documentar el origen del género en un comentario breve junto a la función y verificar que el texto describe el comportamiento implementado

## 2. Corrección de la ruta de tracklist

- [x] 2.1 Añadir el import faltante de `SpotifyArtist` en `src/app/api/getAlbumTracklist/route.ts` y verificar que el proyecto compila sin errores de tipos (`npx tsc --noEmit`)

## 3. Eliminación de código muerto

- [x] 3.1 Verificar por búsqueda que no existan referencias a `moodActivityMapper`, `useActivityRecommendations`, `getRecommendationsByActivity`, `getRecomendation` (ruta API), `ConfirmRemoveFavoriteStep` ni `UndoFavoriteModal`
- [x] 3.2 Eliminar los archivos vacíos o rotos confirmados sin referencias y verificar que la app arranca (`npm run dev`) sin errores de importación
- [x] 3.3 Eliminar los componentes huérfanos confirmados sin referencias y verificar que el modal de guardado sigue funcionando en `/search`
- [x] 3.4 Eliminar las exportaciones muertas de `src/lib/api/recomendation.ts` (`getRecommendationsByActivity`, `getRandomUnseenRecommendation*`) y los `console.log` de depuración, y verificar que la recomendación por emoción sigue funcionando

## 4. Corrección de errores preexistentes que rompían el build

- [x] 4.1 Corregir los errores de tipos que bloqueaban `next build`: tipo de `allMoods` en `MoodSelector`, clave duplicada en `activityRecommendations`, parámetro `artist` en `RecomendationPage`, forma de pistas en `AlbumTracklist`, y verificar con `npx tsc --noEmit`
- [x] 4.2 Reescribir `src/app/recomendation/page.tsx` eliminando el JSX muerto tras el `redirect` y verificar que la ruta redirige a `/recommendation`
- [x] 4.3 Envolver el uso de `useSearchParams()` en un límite `Suspense` en `/recommendation` y `/login` y verificar que `npm run build` completa sin errores de prerender

## 5. Arreglo del lint

- [x] 5.1 Corregir `eslint.config.mjs` para que use *flat config* correctamente (registrar `eslint-plugin-prettier`, añadir `eslint-config-prettier` e `ignores`) y verificar que `npx eslint .` ejecuta sin el error de formato de config
- [x] 5.2 Corregir los errores de lint (`<a>` internos → `Link` en `/login`; `@ts-ignore` → `@ts-expect-error` en `I18nContext`) y verificar con `npx eslint . --quiet` que no quedan errores
- [x] 5.3 Ejecutar `npm run format` para eliminar los avisos de formato y verificar que `npm run lint` termina con código 0

## 6. Verificación final

- [x] 6.1 Ejecutar `npx tsc --noEmit` y `npm run build` y verificar que no hay errores
- [x] 6.2 Ejecutar `openspec validate fix-favorites-filter-and-cleanup` y verificar que el change es válido

## Workflow follow-up

- Archivar el change cuando se cumplan los requisitos de revisión del proyecto.
