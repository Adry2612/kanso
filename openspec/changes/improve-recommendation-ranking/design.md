# Design

## Context

- La recomendación por emoción (`services/server/recommendations.ts` → `recommendByMood`) ordena candidatos y elige al azar entre los tres mejores.
- La recomendación por actividad vive en `utils/recommendations.ts` → `computeActivityRecommendations`.
- El historial de las últimas 10 recomendaciones está en `users/{uid}/recomendationHistory`.
- Las valoraciones están en `users/{uid}/recommendationFeedback`.
- La colección guarda `labeledFeelings` y `activities` por álbum.
- Spotify retiró `audio-features` para apps nuevas o en desarrollo el 27 de noviembre de 2024; las claves actuales reciben `403`. No hay señal de audio fiable que usar.

## Goals / Non-Goals

**Goals:**

- Recomendar solo con señales propias y explicables: emociones etiquetadas, recencia y valoración.
- Evitar recomendar un álbum que no coincide con ninguna emoción pedida.
- Mantener la variedad con una selección entre los tres mejores.
- Conservar la valoración y las etiquetas/actividades en el resultado.

**Non-Goals:**

- Integrar otra API de audio features o análisis de audio.
- Cambiar el catálogo de emociones o actividades.
- Recomendar álbumes fuera de la colección.
- Cambiar la API pública de recomendaciones.

## Decisions

### 1. Puntuación por etiquetas

```
label = proporción de emociones pedidas presentes en labeledFeelings   (0..1)
score = label − W_RECENT × recencyPenalty + W_FEEDBACK × feedbackBoost
```

Constantes: `W_RECENT = 0.35`, `W_FEEDBACK = 0.5`. `baseScore` es `label`.

Un candidato solo compite si `label > 0`. Sin audio no hay forma de justificar una recomendación para un álbum que no tiene ninguna de las emociones pedidas; devolverlo sería un falso positivo. Si ninguno supera el filtro, la respuesta es `404` y la vista muestra su estado sin coincidencias.

La selección final se hace entre los tres candidatos con mayor `score`; si hay menos de tres, entre todos. El desempate es aleatorio para no repetir siempre el mismo disco.

### 2. Recomendación por actividad

Para la actividad se calculan las `optimalMoods` como hasta ahora. De cada álbum se obtienen las emociones etiquetadas que coinciden (`matchingMoods`) y `label = matchingMoods.length / optimalMoods.length`. Se descartan los álbumes con `label = 0`, se aplica la misma fórmula con recencia y valoración, y se ordenan por `score`. El primero es el álbum recomendado. Los filtros de formato y etiquetas se aplican antes de puntuar.

### 3. Valoración

`topMoods` se resuelve con hasta tres emociones etiquetadas del álbum (normalizadas y sin duplicados), no con audio. La valoración directa suma o resta el signo completo; un álbum que comparte alguna de esas emociones recibe la mitad. Se guarda en `users/{uid}/recommendationFeedback` con `{ albumId, liked, topMoods, updatedAt }` y se puede sustituir.

### 4. Resultado

Se mantiene lo ya implementado: `labeledFeelings` y `activities` como chips de solo lectura y el control de valoración junto a Spotify. El panel de debug (otro change) pierde la fila de afinidad de audio y gana el desglose de etiquetas, recencia y valoración.

### 5. Eliminación del audio

Se retiran de `src/utils/recommendations.ts` los perfiles `MOOD_AUDIO_PROFILES`, `moodAffinity`, `audioAffinity`, `topMoodsByAffinity`, `W_AUDIO`, `W_UNLABELED` y el tipo `AudioFeatures`. Se retira `getAlbumAudioFeaturesAverage` de `src/services/server/spotify.ts` y la caché/lotes de `src/services/server/recommendations.ts`. No quedan llamadas a `audio-features` en el camino de recomendación.

## Risks / Trade-offs

- **Menos candidatos** → solo compiten álbumes etiquetados con alguna emoción pedida. Es el comportamiento correcto: mejor un vacío que un disco que no encaja.
- **Más estados sin coincidencias** → la persona puede no haber etiquetado sus discos con esa emoción; el estado vacío ya invita a añadir o revisar la colección.
- **Sin refuerzo de audio** → dos álbumes con la misma proporción de emociones se diferencian solo por recencia y valoración. Es predecible y explicable.
- **La similitud del feedback depende de las etiquetas** → si un álbum no tiene emociones, no puede heredar valoraciones; es coherente con el resto del ranking.
- **El top-3 aleatorio puede no devolver siempre el primero** → se mantiene por variedad; el panel de debug mostrará el ranking completo y el elegido.

## Migration Plan

Sin migración de datos:

1. Eliminar perfiles, afinidad y llamadas de audio, y actualizar tests.
2. Ajustar la puntuación y el filtro de coincidencia en emoción y actividad.
3. Resolver `topMoods` de la valoración con etiquetas.
4. Verificar flujos, vacíos, recencia y valoración; rollback revirtiendo el commit.

## Open Questions

Ninguna. La fuente de moods es exclusivamente lo que la persona etiqueta.
