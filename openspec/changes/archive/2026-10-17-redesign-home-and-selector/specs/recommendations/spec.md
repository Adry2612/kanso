# Spec Delta

## MODIFIED Requirements

### Requirement: Catálogo de emociones

El sistema DEBE ofrecer un catálogo de 15 emociones con etiqueta, emoji y símbolo, DEBE normalizar sinónimos y variantes a una clave canónica, y DEBE mostrarlas todas a la vez en el selector, sin paginar, con su emoji y una etiqueta legible en el tema activo.

#### Scenario: Emociones disponibles

- **WHEN** la persona abre el selector de emociones
- **THEN** el sistema muestra las 15 emociones del catálogo, todas visibles a la vez

#### Scenario: Normalización de sinónimos

- **WHEN** llega una emoción como texto libre o en otro idioma
- **THEN** el sistema la resuelve a su clave canónica o la descarta si no la reconoce

### Requirement: Catálogo de actividades

El sistema DEBE ofrecer un catálogo de 9 actividades —trabajar, estudiar, hacer ejercicio, cocinar, relajarse, jugar, desplazarse, tareas del hogar y fiesta— con etiqueta y emoji, y DEBE mostrarlas todas a la vez en el selector, sin paginar.

#### Scenario: Actividades disponibles

- **WHEN** la persona abre el selector de actividades
- **THEN** el sistema muestra las 9 actividades del catálogo, todas visibles a la vez

## ADDED Requirements

### Requirement: Un único punto de entrada a la recomendación

La pantalla de inicio DEBE presentar una sola decisión principal —emoción o actividad— como vía dominante, y la recomendación rápida DEBE quedar como vía secundaria y visualmente subordinada, sin dos llamadas a la acción del mismo peso.

#### Scenario: Jerarquía clara

- **WHEN** la persona abre el inicio
- **THEN** ve un único panel principal para elegir emoción o actividad y, subordinada, la vía de recomendación rápida

#### Scenario: Recomendación rápida secundaria

- **WHEN** la persona elige la recomendación rápida
- **THEN** el sistema le pide solo formato o etiqueta y genera la recomendación sin pedir emociones
