# Spec Delta

## MODIFIED Requirements

### Requirement: Aparición animada del contenido

El sistema DEBE revelar el contenido principal con una animación de entrada que puede escalonarse entre elementos relacionados. Cuando el contenido se genera tras una acción o una carga (resultados de búsqueda, listas y rejillas de datos), la animación DEBE reproducirse al montarse el contenido y no depender de que el elemento entre en el viewport, de modo que nunca quede oculto.

#### Scenario: Entrada de listas y rejillas

- **WHEN** una rejilla o lista aparece en pantalla
- **THEN** sus elementos entran de forma escalonada en lugar de aparecer todos a la vez

#### Scenario: Contenido generado tras una acción

- **WHEN** una rejilla o lista aparece como resultado de una acción o de una carga de datos
- **THEN** su animación de entrada se reproduce al aparecer, aunque el elemento ya estuviera en pantalla o la pestaña no estuviera visible, sin quedar oculto
