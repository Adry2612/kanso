# Spec Delta

## MODIFIED Requirements

### Requirement: Tema claro y oscuro

El sistema DEBE permitir alternar entre tema claro y oscuro aplicándolo a toda la interfaz. Ninguna pantalla DEBE fijar colores que solo funcionen en un tema: los colores DEBEN salir de los tokens del tema, de modo que el contraste se mantenga legible en ambos.

#### Scenario: Selección de tema

- **WHEN** la persona elige "Claro" u "Oscuro" en ajustes
- **THEN** el sistema aplica el tema correspondiente a toda la aplicación

#### Scenario: Tema por defecto

- **WHEN** no hay preferencia de tema guardada
- **THEN** el sistema usa el tema claro

#### Scenario: Legibilidad en ambos temas

- **WHEN** se aplica un tema
- **THEN** todos los textos y superficies de todas las pantallas usan los tokens del tema y mantienen un contraste legible

## ADDED Requirements

### Requirement: Colores desde tokens

El sistema DEBE definir sus colores con los tokens del tema (`var(--collectify-*)` y `var(--surface-*)`) y DEBE evitar valores de color fijos que dependan de un solo tema.

#### Scenario: Cambio de tema sin restos

- **WHEN** la persona cambia de tema
- **THEN** ninguna pantalla conserva colores pensados para el otro tema
