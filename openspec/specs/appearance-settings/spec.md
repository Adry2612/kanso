# Apariencia y ajustes

## Purpose

Permite elegir entre tema claro y oscuro y gestionar la cuenta desde la página de ajustes, incluyendo el acceso al inicio y el cierre de sesión.

## Requirements

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

### Requirement: Persistencia del tema

El sistema DEBE recordar el tema elegido entre visitas.

#### Scenario: Restauración del tema

- **WHEN** la persona vuelve a abrir la aplicación tras elegir un tema
- **THEN** el sistema restaura el tema guardado

### Requirement: Sección de apariencia

El sistema DEBE ofrecer en ajustes una sección de apariencia con las opciones de tema y el tema activo resaltado.

#### Scenario: Opciones de apariencia

- **WHEN** el usuario abre los ajustes
- **THEN** el sistema muestra las opciones de tema claro y oscuro con el tema activo resaltado

### Requirement: Gestión de cuenta en ajustes

El sistema DEBE ofrecer desde ajustes el acceso al inicio y el cierre de sesión.

#### Scenario: Ir al inicio

- **WHEN** la persona pulsa "Ir al inicio"
- **THEN** el sistema la lleva a `/home`

#### Scenario: Cerrar sesión desde ajustes

- **WHEN** la persona pulsa "Cerrar sesión"
- **THEN** el sistema cierra la sesión y la redirige al inicio público

### Requirement: Regreso desde ajustes

El sistema DEBE ofrecer volver a la pantalla anterior desde ajustes.

#### Scenario: Volver

- **WHEN** la persona pulsa "Volver"
- **THEN** el sistema regresa a la pantalla anterior

### Requirement: Colores desde tokens

El sistema DEBE definir sus colores con los tokens del tema (`var(--collectify-*)` y `var(--surface-*)`) y DEBE evitar valores de color fijos que dependan de un solo tema.

#### Scenario: Cambio de tema sin restos

- **WHEN** la persona cambia de tema
- **THEN** ninguna pantalla conserva colores pensados para el otro tema
