# Tasks

## 1. Coordinación

- [x] 1.1 Registrar la línea base con `npx tsc --noEmit` y `npm run lint`, y confirmar que los cambios `polish-visual-consistency` y `shared-album-view-and-cover-viewer` siguen activos sin que este cambie sus requisitos

## 2. Retirar el audio de Spotify

- [x] 2.1 Eliminar de `src/utils/recommendations.ts` `MOOD_AUDIO_PROFILES`, `moodAffinity`, `audioAffinity`, `topMoodsByAffinity`, `W_AUDIO`, `W_UNLABELED` y los tipos/parámetros de audio
- [x] 2.2 Eliminar `getAlbumAudioFeaturesAverage` de `src/services/server/spotify.ts` y los tipos `SpotifyAudioFeatures`/`SpotifyAudioFeaturesResponse` si quedan sin uso
- [x] 2.3 Eliminar de `src/services/server/recommendations.ts` la caché de audio, `audioFeaturesFor`, `audioFeaturesForAlbums` y todos sus parámetros y llamadas

## 3. Ranking por etiquetas, recencia y valoración

- [x] 3.1 Definir `scoreCandidateBreakdown` con `labelOverlap`, `recencyPenalty`, `feedbackBoost` y `finalScore`, conservando `W_RECENT = 0.35` y `W_FEEDBACK = 0.5`
- [x] 3.2 En `recommendByMood`, descartar candidatos con `labelOverlap = 0`, devolver 404 si no queda ninguno y elegir entre los tres mejores con desempate aleatorio
- [x] 3.3 En `computeActivityRecommendations`, calcular `labelOverlap` con las emociones etiquetadas, descartar los de solape 0 y ordenar por la nueva puntuación
- [x] 3.4 Actualizar `feedbackBoostFor` para usar solo emociones etiquetadas y resolver `topMoods` de la valoración con esas emociones
- [x] 3.5 Actualizar `src/utils/recommendations.test.ts`: quitar tests de audio y cubrir ranking por etiquetas, sin coincidencias, recencia, valoración y similitud por etiquetas

## 4. Valoración y resultado

- [x] 4.1 Mantener el control «¿Te gustó esta recomendación?» en `actions`, junto al botón de Spotify
- [x] 4.2 Mantener `labeledFeelings` y `activities` como chips de solo lectura en `meta`
- [x] 4.3 Simplificar la resolución de `topMoods` en `rateRecommendation` para usar las etiquetas del álbum
- [x] 4.4 Quitar la fila de afinidad de audio de `RecommendationExplain` y ajustar el tipo de desglose

## 5. Verificación y regresión

- [x] 5.1 Ejecutar `npx tsc --noEmit`, `npm run lint` y `npm test`; cuando el servidor de desarrollo esté parado, `npm run build`
- [x] 5.2 Verificar con datos sintéticos: más emociones coincidentes gana, un álbum sin coincidencia queda fuera, la recencia baja el peso y la valoración sube/baja el álbum y sus similares
- [ ] 5.3 Recorrer emoción y actividad en claro/oscuro a 320, 390, 768 y 1440 px, confirmando que una emoción con coincidencias devuelve un disco y una sin coincidencias muestra el estado vacío
- [x] 5.4 Validar el cambio con `npx openspec validate improve-recommendation-ranking --strict`
