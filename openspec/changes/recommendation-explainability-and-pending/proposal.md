# Proposal

## Why

La recomendación sigue siendo una caja negra: se ve el disco, pero no los filtros, la coincidencia de emociones, la recencia ni la valoración que llevaron a elegirlo. Además, los álbumes de «Por escuchar» no pueden competir en una recomendación por emoción porque no tienen emociones etiquetadas; forzarlos sería un falso positivo. Para esos discos tiene más sentido un descubrimiento aleatorio explícito.

## What Changes

- **Explicación estructurada.** Las respuestas de recomendación incluyen `explain` con filtros aplicados, recuento de candidatos, desglose del álbum elegido y alternativas.
- **Panel de desarrollo.** El resultado muestra un desplegable «Por qué este disco» y emite el mismo payload por consola cuando `NEXT_PUBLIC_RECOMMENDATION_DEBUG=true`.
- **Pendientes fuera de la recomendación por emoción.** Se retira `includePending` de la API, servicios, URL y selector. Un pendiente no tiene emociones, formato ni etiquetas, así que no compite en el ranking por etiquetas.
- **Descubrimiento aleatorio.** La pestaña «Por escuchar» incorpora «Sorpréndeme»: elige un pendiente al azar y abre su ficha, sin emoción, filtros ni puntuación.
- **Sin audio.** La explicación y el ranking usan solo etiquetas, recencia y valoración.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `recommendations`: toda recomendación expone una explicación estructurada y el panel de desarrollo la muestra.
- `listen-later`: se añade el descubrimiento aleatorio de pendientes; los pendientes dejan de participar en recomendaciones por emoción.

## Impact

- Tipos y respuestas de recomendación; `services/server/recommendations.ts`, `utils/recommendations.ts`, `RecommendationExplain` y `RecomendationPage`.
- `src/app/collection/page.tsx` para el botón «Sorpréndeme».
- Traducciones ES/EN y `docs/TRADUCCIONES.md`.
- Sin cambios de Firestore, sin audio y sin dependencias nuevas.
