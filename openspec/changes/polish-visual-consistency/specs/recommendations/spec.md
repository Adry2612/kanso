# Spec Delta

## ADDED Requirements

### Requirement: Alineación a la izquierda de la cuadrícula del historial

En la vista de cuadrícula, el historial DEBE (MUST) alinear sus tarjetas al inicio del área de contenido, dejando el espacio sobrante a la derecha, en lugar de centrar la cuadrícula. La colección NO DEBE (MUST NOT) verse afectada y la vista de lista DEBE (MUST) conservar la alineación actual.

#### Scenario: Ventana ancha

- **WHEN** la persona abre el historial en una ventana de 2400 px o más con entradas suficientes
- **THEN** las tarjetas empiezan en el borde izquierdo del área de contenido y el espacio sobrante queda a la derecha

#### Scenario: Pocas entradas

- **WHEN** el historial tiene una o dos entradas en escritorio
- **THEN** las tarjetas se alinean a la izquierda y no se desplazan al centro del contenido

#### Scenario: Vista de lista

- **WHEN** la persona cambia el historial a la vista de lista
- **THEN** las filas conservan su alineación y presentación actuales

#### Scenario: Colección sin cambios

- **WHEN** la persona abre la colección en cuadrícula en una pantalla ancha
- **THEN** la cuadrícula mantiene el centrado que ya tenía
