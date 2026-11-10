# Tasks

## 1. Coordinación y taxonomía

- [x] 1.1 Registrar la línea base con `npx tsc --noEmit`, `npm run lint` y `npm test`, y comprobar el estado de `derive-genre-from-spotify`; verificar que sigue completo y anotar que debe archivarse o fusionarse antes que este cambio
- [x] 1.2 Crear `src/constants/taxonomy.ts` con `LANGUAGE_KEYS`, `GENRE_KEYS` reutilizando `GENRE_BRANCHES`, alias de idioma/género, `canonicalizeTag`, `canonicalizeTags` y `tagDisplayLabel`; verificar con `npx tsc --noEmit`
- [x] 1.3 Añadir tests de taxonomía: `Electrónica`/`electronica`/`Electronic` → `electronic`, `Inglés`/`English` → `en`, categorías `genero`/`genre`, valores fuera de catálogo y deduplicación de un solo valor por eje; verificar con `npm test`
- [x] 1.4 Añadir a `src/locales/es.json` y `src/locales/en.json` los espacios `taxonomy.genres.*` y `taxonomy.languages.*`, y documentarlos en `docs/TRADUCCIONES.md`; verificar que `tagDisplayLabel` devuelve la etiqueta traducida en ambos idiomas

## 2. Servidor y datos

- [x] 2.1 Aplicar `canonicalizeTags` en `normalizeTags` de `src/services/server/collection/service.ts` para descartar valores de idioma/género fuera del catálogo y conservar el resto de categorías; verificar con tests de guardado que una petición con `Electrónica` guarda `electronic` y una con un valor inventado no lo guarda
- [x] 2.2 Implementar `pickMainGenre` en `src/utils/genres.ts` con desempate por artista principal y orden canónico, y tests de casos: una rama repetida, empate entre artistas y álbum sin géneros; verificar con `npm test`
- [x] 2.3 Exponer `{ main, branches }` en `deriveAlbumGenreBranches`/`deriveAlbumMainGenre` y en `GET /api/albumGenres`; adaptar `getAlbumGenres`/`getAlbumGenre` en `src/services/client/albums.ts` y verificar la respuesta con un álbum de prueba y un fallo simulado de Spotify
- [x] 2.4 Actualizar `useSaveAlbumWizard` para preseleccionar solo el género principal derivado y no pedir idioma; verificar que un álbum nuevo recibe como máximo una etiqueta de género y ninguna de idioma

## 3. Guardado, filtros y visualización

- [x] 3.1 Sustituir `TagEditor` en `SaveAlbumFormatStep` por dos selectores `OptionSelector` de selección única (idioma con «Sin idioma» y género con las 16 ramas), eliminar el texto libre y retirar `TAG_SUGGESTIONS`/`customPlaceholder` si quedan sin uso; verificar guardado, cambio de género y guardado sin etiquetas
- [x] 3.2 Ajustar `FilterModal` para usar géneros canónicos y un selector de idiomas presentes en la colección, eliminar el grupo duplicado de idioma/género y mantener «Otras» para categorías antiguas; verificar filtros de género, idioma, combinados y limpiar filtros
- [x] 3.3 Usar `tagDisplayLabel` en `TagList`, chips de colección, filtros activos, búsqueda, inicio y `RecommendationFilterSummary`; verificar que una etiqueta `electronic` se ve «Electrónica» en español y «Electronic» en inglés sin cambiar el dato
- [x] 3.4 Normalizar `album.genres` con `normalizeGenreValue` en `getCollectionGenres` y verificar con un álbum que tenga géneros crudos y con etiquetas heredadas que el filtro de género encuentra ambos casos

## 4. Resultado y carga de la recomendación

- [x] 4.1 Extraer el panel «Mi disco» del detalle a `AlbumRecordPanel` (emociones, actividades, formatos y etiquetas) y usarlo en `src/app/albums/[albumId]/page.tsx`; verificar que el detalle mantiene exactamente sus secciones y su estado vacío
- [x] 4.2 Añadir `format` y `tags` a `RecommendedAlbum`, rellenarlos en `computeActivityRecommendations` y pasar `aside={<AlbumRecordPanel … />}` desde `RecomendationPage` en los tres flujos; verificar que la recomendación por actividad muestra formatos y etiquetas y que ya no duplica emociones en `meta`
- [x] 4.3 Comparar en navegador el detalle desde colección y el resultado de recomendación: misma ficha, mismo ancho de tracklist, mismo panel y mismas acciones permitidas (Spotify y valoración, sin editar/eliminar)
- [x] 4.4 Añadir `variant="bare"` a `VinylCrateLoader`, crear el estado de carga centrado con mensaje y retirar los esqueletos de portada, título y tracklist; verificar `role="status"`, `aria-busy`, texto visible y animación estática con `prefers-reduced-motion`
- [x] 4.5 Añadir `recommendation.loading.title` y `recommendation.loading.description` a ES/EN y documentarlas en `docs/TRADUCCIONES.md`; verificar el estado de carga en ambos idiomas

## 5. Migración de etiquetas

- [x] 5.1 Crear `scripts/migrate-tags.mjs` con `collectionGroup("collection")`, `--dry-run`, `--user <uid>`, informe de cambios/conflictos/no reconocidos e idempotencia; verificar con `node scripts/migrate-tags.mjs --dry-run` sobre la cuenta de prueba
- [x] 5.2 Ejecutar el dry-run, revisar el informe de valores no reconocidos y confirmar que no se borra ninguna etiqueta; verificar que un segundo dry-run reporta cero cambios
- [x] 5.3 Ejecutar la migración real en la cuenta de prueba y comprobar que idioma y género quedan canónicos, sin duplicados, y que un segundo pase no modifica nada
- [x] 5.4 Documentar en `docs/ARCHITECTURE.md` o en el README del script el uso, el informe y la recomendación de copia previa; verificar que los comandos documentados funcionan tal cual

## 6. Integración y verificación

- [x] 6.1 Ejecutar `npx tsc --noEmit`, `npm run lint`, `npm test` y, con el servidor de desarrollo parado, `npm run build`; verificar que no hay errores nuevos
- [x] 6.2 Recorrer guardado, edición, filtros, recomendación por emoción, por actividad y rápida, y el estado sin coincidencias en tema claro y oscuro a 320, 390, 768 y 1440 px; verificar que no hay desbordes ni etiquetas sin traducir
- [x] 6.3 Validar el cambio con `openspec validate canonical-tags-and-recommendation-ui --strict` y comprobar que los deltas no contradicen `derive-genre-from-spotify` ni `recommendation-explainability-and-pending`

## Workflow follow-up

- Archivar `derive-genre-from-spotify` antes de archivar este cambio, o fusionar su delta de género derivado con el requisito de género principal.
- Archivar este cambio cuando la migración y la QA estén verificadas.
