# Spec Delta

## ADDED Requirements

### Requirement: Descubrimiento aleatorio de pendientes

La pestaña «Por escuchar» DEBE (MUST) ofrecer una acción «Sorpréndeme» cuando haya álbumes pendientes. La acción DEBE (MUST) elegir uno al azar y abrir su ficha. NO DEBE (MUST NOT) pedir emoción, formato ni etiquetas, ni modificar el estado del pendiente.

#### Scenario: Descubrir un pendiente

- **WHEN** la persona pulsa «Sorpréndeme» y tiene álbumes pendientes
- **THEN** el sistema elige uno al azar y abre su ficha

#### Scenario: Sin pendientes

- **WHEN** la lista de pendientes está vacía
- **THEN** la acción no se muestra

#### Scenario: El pendiente sigue pendiente

- **WHEN** un pendiente se abre desde «Sorpréndeme»
- **THEN** sigue en la lista de pendientes y no se añade a la colección

#### Scenario: Sin filtros de recomendación

- **WHEN** la persona descubre un pendiente
- **THEN** no se aplican emociones, formato, etiquetas ni puntuación; es una elección aleatoria
