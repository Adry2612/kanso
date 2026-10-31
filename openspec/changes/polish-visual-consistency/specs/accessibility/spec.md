# Spec Delta

## ADDED Requirements

### Requirement: Cursor de interacción en elementos interactivos

Todo elemento interactivo DEBE (MUST) mostrar cursor de puntero al pasar el ratón: botones nativos, enlaces, elementos con `role="button"` y contenedores con manejador de clic. Los controles deshabilitados DEBEN (MUST) mostrar cursor no permitido. La afordancia DEBE (MUST) ser consistente en tema claro y oscuro y no alterar el foco de teclado.

#### Scenario: Botones y enlaces

- **WHEN** la persona pasa el puntero sobre un botón o un enlace habilitado
- **THEN** el cursor cambia a puntero

#### Scenario: Tarjetas y chips clicables

- **WHEN** la persona pasa el puntero sobre una tarjeta, un chip o una fila que responde a un clic
- **THEN** el cursor cambia a puntero aunque el elemento no sea un botón nativo

#### Scenario: Control deshabilitado

- **WHEN** la persona pasa el puntero sobre un botón o control deshabilitado
- **THEN** el cursor indica que no se puede interactuar

#### Scenario: Navegación por teclado

- **WHEN** la persona navega con el tabulador
- **THEN** el indicador de foco visible sigue apareciendo igual que antes del cambio
