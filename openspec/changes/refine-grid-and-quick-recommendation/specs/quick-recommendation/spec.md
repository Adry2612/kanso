# Spec Delta

## ADDED Requirements

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
