# quick-recommendation Specification

## Purpose
Permite obtener una recomendación de la colección con una sola decisión ligera —formato físico y/o etiqueta— sin tener que elegir una emoción.

## Requirements

### Requirement: Acceso a la recomendación rápida

El sistema DEBE ofrecer en la pantalla de inicio un acceso de recomendación rápida que pida únicamente el formato físico y/o una etiqueta, sin pedir una emoción.

#### Scenario: Abrir la recomendación rápida

- **WHEN** la persona pulsa "Recomendación rápida" en la pantalla de inicio
- **THEN** el sistema muestra una elección mínima con formatos físicos y, si existen, etiquetas de su colección, sin pedir emoción

#### Scenario: Elegir solo formato

- **WHEN** la persona elige un formato físico y confirma
- **THEN** el sistema obtiene una recomendación de su colección en ese formato

#### Scenario: Elegir solo etiqueta

- **WHEN** la persona elige una etiqueta y confirma
- **THEN** el sistema obtiene una recomendación de su colección con esa etiqueta

#### Scenario: Sin filtros

- **WHEN** la persona confirma sin elegir formato ni etiqueta
- **THEN** el sistema obtiene una recomendación cualquiera de su colección

#### Scenario: Sin coincidencias

- **WHEN** no hay ninguna entrada que cumpla los filtros elegidos
- **THEN** el sistema muestra el estado sin coincidencias de la recomendación
