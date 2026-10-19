# Spec Delta

## MODIFIED Requirements

### Requirement: Panel lateral de navegación

El sistema DEBE mostrar un panel lateral en las páginas privadas con accesos a Inicio, Búsqueda, Artistas, Novedades, Amigos, Favoritos, Historial y Ajustes.

#### Scenario: Navegación entre secciones

- **WHEN** el usuario pulsa una sección del panel
- **THEN** el sistema lo lleva a la ruta correspondiente

#### Scenario: Acceso a las novedades

- **WHEN** el usuario pulsa "Novedades"
- **THEN** el sistema lo lleva a `/releases`

#### Scenario: Acceso a amigos

- **WHEN** el usuario pulsa "Amigos"
- **THEN** el sistema lo lleva a `/friends`

### Requirement: Ocultar panel en páginas públicas

El sistema DEBE ocultar el panel lateral en las páginas públicas, incluidas la bienvenida, el acceso y la vista de perfil compartido.

#### Scenario: Página pública

- **WHEN** la persona abre `/` o `/login`
- **THEN** el sistema no muestra el panel lateral

#### Scenario: Perfil compartido

- **WHEN** la persona abre `/f/<código>`
- **THEN** el sistema muestra la vista pública sin el panel lateral
