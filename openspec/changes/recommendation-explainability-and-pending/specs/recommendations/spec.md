# Spec Delta

## ADDED Requirements

### Requirement: Explicación de la recomendación

Toda respuesta de recomendación DEBE (MUST) incluir una explicación estructurada con los filtros aplicados, el recuento de candidatos antes y después de filtrar, el desglose de la puntuación del álbum elegido y hasta tres alternativas con su puntuación.

#### Scenario: Recomendación por emoción explicada

- **WHEN** el sistema entrega una recomendación por emoción
- **THEN** la explicación incluye las emociones pedidas, el formato y las etiquetas aplicados, el recuento de candidatos y el desglose del álbum elegido

#### Scenario: Recomendación por actividad explicada

- **WHEN** el sistema entrega una recomendación por actividad
- **THEN** la explicación incluye la actividad, las emociones óptimas, los filtros aplicados y el desglose del álbum elegido

#### Scenario: Desglose de puntuación

- **WHEN** se explica el álbum elegido
- **THEN** la explicación muestra por separado la coincidencia de emociones etiquetadas, la penalización por recencia, el ajuste por valoración y la puntuación final

#### Scenario: Alternativas

- **WHEN** hay más de un candidato
- **THEN** la explicación incluye hasta tres alternativas ordenadas por puntuación, con su puntuación final

### Requirement: Panel de desarrollo de la recomendación

Cuando `NEXT_PUBLIC_RECOMMENDATION_DEBUG` valga `true`, el resultado de la recomendación DEBE (MUST) mostrar un desplegable «Por qué este disco» con la explicación y DEBE (MUST) emitir el mismo contenido por consola. Cuando valga cualquier otra cosa o no esté definida, NO DEBE (MUST NOT) mostrarse el desplegable ni emitirse el log.

#### Scenario: Herramienta activada

- **WHEN** la variable de entorno vale `true` y se muestra una recomendación
- **THEN** aparece el desplegable con filtros, recuentos, puntuación y alternativas, y la consola recibe el mismo payload

#### Scenario: Herramienta desactivada

- **WHEN** la variable no vale `true`
- **THEN** el resultado no muestra el desplegable y no se escribe ningún log de recomendación

#### Scenario: Sin alternativas

- **WHEN** solo hay un candidato y la herramienta está activa
- **THEN** el desplegable muestra el álbum elegido y su desglose sin una sección de alternativas vacía
