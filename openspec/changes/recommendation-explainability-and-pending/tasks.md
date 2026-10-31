# Tasks

## 1. Coordinación

- [x] 1.1 Registrar la línea base y confirmar que el ranking por etiquetas, recencia y valoración está aplicado

## 2. Explicación

- [x] 2.1 Añadir `RecommendationExplanation`, `RecommendationCandidateExplanation` y el desglose sin audio a `src/types/recommendations.ts`
- [x] 2.2 Construir `explain` en `recommendByMood` con filtros, recuentos, elegido y alternativas
- [x] 2.3 Construir `explain` en `computeActivityRecommendations` con actividad, emociones óptimas, desglose y alternativas
- [x] 2.4 Mostrar el panel `RecommendationExplain` solo con `NEXT_PUBLIC_RECOMMENDATION_DEBUG=true` y emitir el `console.debug`
- [x] 2.5 Mostrar la fórmula y los aportes ponderados de recencia y valoración, aclarando que la puntuación es relativa

## 3. Pendientes

- [x] 3.1 Retirar `includePending` de la API, servicios, hook, URL y selector
- [x] 3.2 Quitar la inclusión de pendientes del ranking por emoción y actividad
- [x] 3.3 Añadir «Sorpréndeme» en la pestaña «Por escuchar», con elección aleatoria y navegación a la ficha
- [x] 3.4 Ocultar la acción cuando no hay pendientes y no modificar su estado al abrirla

## 4. Traducciones y documentación

- [x] 4.1 Añadir las claves ES/EN del panel y de «Sorpréndeme»
- [x] 4.2 Actualizar `docs/TRADUCCIONES.md` y retirar las claves de `includePending`

## 5. Mejoras pendientes

- [ ] 5.1 Ampliar `explain` con la lista de candidatos (top 10), emociones etiquetadas/coincidentes/faltantes, posición de recencia y motivo de la valoración
- [ ] 5.2 Mostrar esa tabla de candidatos en el panel, con el elegido resaltado y su ranking
- [ ] 5.3 Revisar el panel en claro/oscuro a 320, 390, 768 y 1440 px y probar «Sorpréndeme» con una cuenta con pendientes
- [x] 5.4 Ejecutar `npx tsc --noEmit`, `npm run lint`, `npm test` y `npm run build`
- [x] 5.5 Validar el cambio con `npx openspec validate recommendation-explainability-and-pending --strict`
