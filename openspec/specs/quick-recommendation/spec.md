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

### Requirement: Filtros aplicados visibles en el resultado

Cuando la recomendación se pide por la vía rápida, el resultado DEBE (MUST) mostrar al principio, antes de la portada y el título, el formato y las etiquetas elegidas. Si no se eligió formato, DEBE (MUST) indicar «Cualquier formato»; si no hay etiquetas, NO DEBE (MUST NOT) mostrar chips de etiqueta. En las recomendaciones por emoción o actividad NO DEBE (MUST NOT) mostrarse este resumen.

#### Scenario: Solo formato

- **WHEN** la persona pide una recomendación rápida eligiendo el formato vinilo
- **THEN** el resultado muestra al principio la etiqueta «Vinilos» y no muestra chips de etiqueta

#### Scenario: Solo etiqueta

- **WHEN** la persona pide una recomendación rápida eligiendo una etiqueta de idioma
- **THEN** el resultado muestra al principio «Cualquier formato» y el chip «Idioma: <valor>»

#### Scenario: Formato y etiqueta

- **WHEN** la persona pide una recomendación rápida eligiendo formato y etiqueta
- **THEN** el resultado muestra ambos filtros al principio, antes de la portada y el título

#### Scenario: Sin filtros

- **WHEN** la persona confirma la recomendación rápida sin elegir formato ni etiqueta
- **THEN** el resultado muestra «Cualquier formato» como único filtro aplicado

#### Scenario: Recomendación por emoción o actividad

- **WHEN** la persona llega al resultado desde el flujo de emoción o actividad
- **THEN** el resultado no muestra el resumen de filtros de la vía rápida

#### Scenario: Pantalla estrecha

- **WHEN** la persona ve el resumen de filtros en una pantalla de 320 px
- **THEN** los chips se reparten en varias líneas sin provocar desplazamiento horizontal
