# Design

## Context

- El ranking usa emociones etiquetadas, recencia y valoración (`scoreCandidateBreakdown`); no hay audio.
- `recommendByMood` y `recommendByActivity` ya construyen `explain` con filtros, recuentos, elegido y alternativas.
- El panel `RecommendationExplain` existe y está gated por `NEXT_PUBLIC_RECOMMENDATION_DEBUG`.
- La colección tiene una pestaña «Por escuchar» con `filteredPending` ya cargado en cliente.
- Un pendiente no tiene emociones, formato ni etiquetas, así que no puede competir en el ranking por etiquetas.

## Goals / Non-Goals

**Goals:**

- Explicar de forma legible de dónde sale la puntuación.
- Ofrecer un descubrimiento aleatorio para los pendientes, sin fingir que encajan por emoción.
- No añadir dependencias ni cambios de datos.

**Non-Goals:**

- Integrar audio features o una API externa de moods.
- Cambiar el ranking o los pesos.
- Añadir un botón para pasar el pendiente a la colección desde el descubrimiento.

## Decisions

### 1. Explicación

`RecommendationExplanation` contiene:

```ts
{
  filters: { moods, activity, format, tags },
  counts: { collection, afterFilters },
  weights: { recent, feedback },
  selected: { albumId, albumName, matchingMoods, score },
  alternatives: CandidateExplanation[],
}
```

El desglose (`RecommendationScoreBreakdown`) es `labelOverlap`, `baseScore`, `recencyPenalty`, `feedbackBoost` y `finalScore`. El panel muestra la coincidencia como porcentaje, la base como decimal y la recencia/valoración como aporte ya ponderado (`−0.35`, `+0.50`), con la fórmula y una nota de que la puntuación es relativa.

### 2. Pendientes fuera del ranking

Se elimina `includePending` de la API, los servicios, el hook, la URL y el selector. `recommendByMood` y `recommendByActivity` leen solo la colección. Un pendiente no compite porque no tiene etiquetas.

### 3. Descubrimiento aleatorio

En la pestaña «Por escuchar», junto al conmutador de vista, aparece «Sorpréndeme» cuando `filteredPending.length > 0`. El botón elige `filteredPending[Math.floor(Math.random() * length)]`, usa el `id` de Spotify del álbum y navega a `/albums/{id}`. No escribe nada ni cambia el estado del pendiente.

### 4. Flag de desarrollo

`NEXT_PUBLIC_RECOMMENDATION_DEBUG === "true"` monta el panel y emite `console.debug` con el payload. Al ser pública, se inlinea en el build: hay que reiniciar el dev server o reconstruir.

## Risks / Trade-offs

- **La puntuación no es un porcentaje** → el panel lo dice explícitamente y muestra los aportes ponderados.
- **El panel básico no lista todos los candidatos** → queda como mejora posterior; hoy explica el elegido y las alternativas.
- **El descubrimiento aleatorio puede repetir** → es una elección al azar; no hay memoria de descubrimientos.
- **Pendientes sin emoción** → no se recomiendan por emoción; el descubrimiento es la vía honesta.

## Migration Plan

Sin migración de datos. Despliegue normal; el flag de debug permanece apagado por defecto.
