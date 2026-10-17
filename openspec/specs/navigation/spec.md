# Navegación

## Purpose

Proporciona la página de bienvenida pública y la navegación principal de la aplicación mediante un panel lateral con acceso a las secciones y a la identidad del usuario.

## Requirements

### Requirement: Página de bienvenida pública

El sistema DEBE mostrar una página de bienvenida pública con acceso a registro, inicio de sesión y prueba como invitado.

#### Scenario: Acceso desde la bienvenida

- **WHEN** una persona sin sesión abre `/`
- **THEN** el sistema muestra la bienvenida con accesos a crear cuenta, iniciar sesión y probar sin registrarse

#### Scenario: Acceso con sesión activa

- **WHEN** una persona con sesión activa abre `/`
- **THEN** el sistema dirige su acceso principal a `/home`

### Requirement: Panel lateral de navegación

El sistema DEBE mostrar un panel lateral en las páginas privadas con accesos a Inicio, Búsqueda, Artistas, Novedades, Favoritos, Historial y Ajustes.

#### Scenario: Navegación entre secciones

- **WHEN** el usuario pulsa una sección del panel
- **THEN** el sistema lo lleva a la ruta correspondiente

#### Scenario: Acceso a las novedades

- **WHEN** el usuario pulsa "Novedades"
- **THEN** el sistema lo lleva a `/releases`

### Requirement: Identidad del usuario

El sistema DEBE mostrar en el panel el nombre o las iniciales del usuario y distinguir las sesiones de invitado.

#### Scenario: Usuario identificado

- **WHEN** el usuario tiene nombre para mostrar
- **THEN** el panel muestra su nombre y sus iniciales

#### Scenario: Sesión de invitado

- **WHEN** el usuario es anónimo
- **THEN** el panel lo identifica como invitado con la etiqueta de sesión de prueba

### Requirement: Panel colapsable

El sistema DEBE permitir colapsar y expandir el panel lateral recordando el estado.

#### Scenario: Colapsar el panel

- **WHEN** la persona colapsa el panel
- **THEN** el sistema lo contrae y guarda el estado

#### Scenario: Restauración del estado

- **WHEN** la persona vuelve a abrir la aplicación
- **THEN** el sistema restaura el estado colapsado o expandido guardado

### Requirement: Ocultar panel en páginas públicas

El sistema DEBE ocultar el panel lateral en las páginas públicas.

#### Scenario: Página pública

- **WHEN** la persona abre `/` o `/login`
- **THEN** el sistema no muestra el panel lateral
