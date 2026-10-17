# Spec Delta

## ADDED Requirements

### Requirement: Contraste de color suficiente

El sistema DEBE mantener un contraste de al menos 4.5:1 para el texto normal y 3:1 para el texto grande (WCAG AA) en todos los temas, tanto para el texto sobre fondos como para el texto sobre los elementos de acento.

#### Scenario: Texto de acento sobre fondo claro

- **WHEN** se muestra texto con el color de acento sobre un fondo del tema
- **THEN** la relación de contraste es de al menos 4.5:1

#### Scenario: Texto sobre el color de acento

- **WHEN** un botón relleno con el color de acento muestra texto encima
- **THEN** la relación de contraste es de al menos 4.5:1

### Requirement: Nombre accesible coherente

Cuando un elemento interactivo tiene texto visible, su nombre accesible DEBE incluir ese texto, de modo que lo que se anuncia coincida con lo que se ve. Los elementos decorativos (como el avatar) DEBEN quedar ocultos para las tecnologías de asistencia.

#### Scenario: Botón con texto visible y etiqueta descriptiva

- **WHEN** un control muestra un texto visible y además tiene un nombre accesible
- **THEN** el nombre accesible contiene el texto visible y no lo contradice

### Requirement: Foco visible

Todos los elementos interactivos DEBEN mostrar un indicador de foco visible al navegar con el teclado.

#### Scenario: Navegación por teclado

- **WHEN** la persona navega con el tabulador
- **THEN** el elemento enfocado muestra un contorno visible con separación suficiente
