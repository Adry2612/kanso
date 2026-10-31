# Proposal

## Why

La recomendación depende hoy de las audio features de Spotify para derivar emociones y reforzar la compatibilidad. Spotify retiró ese endpoint el 27 de noviembre de 2024 para apps nuevas o en modo desarrollo y devuelve `403`, así que la señal de audio no existe en producción. El ranking sigue siendo valioso, pero debe construirse solo con datos que controlamos: las emociones que la persona etiqueta, la recencia y sus valoraciones.

## What Changes

- **Ranking por etiquetas, recencia y valoración.** La recomendación por emoción ordena los álbumes por proporción de emociones coincidentes, penalización por recencia y valoración previa. La de actividad usa el mismo criterio con las emociones óptimas de la actividad.
- **Sin audio de Spotify.** Se eliminan los perfiles de audio, `audioAffinity`, `topMoodsByAffinity`, las llamadas a `audio-features` y sus cachés. No hay dependencia de una API externa para recomendar.
- **Solo candidatos con coincidencia.** Un álbum compite si tiene al menos una emoción etiquetada de las pedidas. Si ninguno coincide tras los filtros de formato y etiquetas, se muestra el estado sin coincidencias en lugar de recomendar un disco que no encaja.
- **Top-3 con desempate aleatorio.** Se conserva la variedad: la selección final sale entre los tres candidatos con mayor puntuación.
- **Valoración basada en etiquetas.** `topMoods` de la valoración se resuelve con las emociones etiquetadas del álbum, no con audio.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `recommendations`: la recomendación por emoción y actividad se pondera con emociones etiquetadas, recencia y valoración; se elimina la afinidad de audio y el estado sin coincidencias vuelve a depender de que exista al menos una emoción coincidente.

## Impact

- `src/utils/recommendations.ts`, `src/services/server/recommendations.ts`, `src/types/recommendations.ts` y sus tests.
- Se retira `getAlbumAudioFeaturesAverage` de `src/services/server/spotify.ts` y los tipos de audio features si quedan sin uso.
- El panel de debug deja de mostrar la afinidad de audio; el resto del resultado (emociones, actividades y valoración) no cambia.
- Sin migración de datos, sin dependencias nuevas y sin cambios en la API pública de recomendaciones.
