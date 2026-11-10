# Spec Delta

## MODIFIED Requirements

### Requirement: Altura útil del viewport

El sistema DEBE dimensionar la interfaz con la altura visible real del navegador y NO DEBE reservar espacio para barras de navegador que puedan estar ocultas. Las pantallas cortas DEBEN llenar esa altura sin generar una franja inferior vacía. Los modales DEBEN ajustarse a esa altura y una sola región DEBE desplazarse cuando el contenido no cabe.

#### Scenario: Barra del navegador visible

- **WHEN** Safari o Chrome muestran su barra inferior
- **THEN** el contenido termina dentro del área visible y ningún control queda tapado por la barra

#### Scenario: Barra del navegador oculta

- **WHEN** la barra del navegador se oculta al hacer scroll
- **THEN** la interfaz se ajusta a la nueva altura sin dejar una franja inferior reservada

#### Scenario: Pantalla con poco contenido

- **WHEN** una pantalla tiene menos contenido que la altura disponible
- **THEN** ocupa el área visible completa sin añadir scroll vertical innecesario

#### Scenario: Modal más alto que la vista

- **WHEN** un modal tiene más contenido del que cabe en la altura visible
- **THEN** el panel se ajusta a esa altura, solo su cuerpo se desplaza y no aparece un segundo scroll en la capa de fondo

#### Scenario: Pantalla densa sin scroll anidado

- **WHEN** la persona recorre la colección en una pantalla estrecha
- **THEN** solo se desplaza el contenido de la pantalla y la capa fija superior permanece en su sitio
