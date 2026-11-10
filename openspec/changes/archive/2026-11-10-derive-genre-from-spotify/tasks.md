# Tasks

## 1. Coordinación

- [x] 1.1 Registrar la línea base con `npx tsc --noEmit`, `npm run lint` y `npm test`, y confirmar que `improve-recommendation-ranking` y `polish-visual-consistency` siguen activos sin que este cambio altere sus requisitos

## 2. Mapeo de género

- [x] 2.1 Crear `src/utils/genres.ts` con `GENRE_BRANCHES`, `mapSpotifyGenreToBranch` y `mapSpotifyGenres` usando las reglas ordenadas de la Decisión 1
- [x] 2.2 Añadir tests del mapeo: `latin hip hop`/`rap español` → `hip-hop`, `powermetal`/`metalcore` → `metal`, géneros sin coincidencia, duplicados y orden canónico

## 3. Derivación desde Spotify

- [x] 3.1 Extender la lectura de artista para incluir `genres` y añadir `deriveAlbumGenreBranches` con caché por artista y `Promise.allSettled`
- [x] 3.2 Añadir `GET /api/albumGenres?albumId=` autenticado y `getAlbumGenres` en `src/services/client/albums.ts`, devolviendo `[]` si Spotify falla

## 4. Guardado y filtros

- [x] 4.1 Rellenar el género en el modal de guardado: si no hay etiqueta `género`, pedir las ramas derivadas y añadirlas como etiquetas editables; conservar la elección de la persona
- [x] 4.2 Ampliar la lista de géneros de `FilterModal` con las ramas canónicas (al menos `metal`, `r&b`, `indie`, `reggaeton`) y comprobar que `getCollectionGenres` sigue uniendo género derivado y etiquetas
- [x] 4.3 Verificar que una etiqueta `género:<rama>` limita la recomendación y que se puede combinar con emoción y formato

## 5. Verificación y regresión

- [x] 5.1 Ejecutar `npx tsc --noEmit`, `npm run lint` y `npm test`; cuando el servidor de desarrollo esté parado, `npm run build`
- [x] 5.2 Comprobar en navegador: guardar un álbum con género autocompletado y editarlo, filtrar colección por hip-hop y metal, y recomendar con género
- [x] 5.3 Recorrer el modal y los filtros en tema claro y oscuro a 320, 390, 768 y 1440 px, sin desborde ni regresiones
- [x] 5.4 Validar el cambio con `npx openspec validate derive-genre-from-spotify --strict`
