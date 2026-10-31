# Spec Delta

## MODIFIED Requirements

### Requirement: Panel lateral de navegación

El sistema DEBE (MUST) mostrar un panel lateral en las páginas privadas con accesos, en este orden, a Inicio, Búsqueda, Colección, Artistas, Novedades, Amigos, Historial y Ajustes.

#### Scenario: Navegación entre secciones

- **WHEN** el usuario pulsa una sección del panel
- **THEN** el sistema lo lleva a la ruta correspondiente

#### Scenario: Orden de las secciones

- **WHEN** el usuario consulta el panel en escritorio o en el cajón móvil
- **THEN** las secciones aparecen en el orden Inicio, Búsqueda, Colección, Artistas, Novedades, Amigos, Historial

#### Scenario: Acceso a la colección

- **WHEN** el usuario pulsa "Colección"
- **THEN** el sistema lo lleva a `/collection` y marca esa sección como activa

#### Scenario: Ruta antigua de la colección

- **WHEN** el usuario abre `/favorites` desde un marcador o un enlace antiguo
- **THEN** el sistema lo redirige de forma permanente a `/collection` sin mostrar un error

#### Scenario: Acceso a las novedades

- **WHEN** el usuario pulsa "Novedades"
- **THEN** el sistema lo lleva a `/releases`

#### Scenario: Acceso a amigos

- **WHEN** el usuario pulsa "Amigos"
- **THEN** el sistema lo lleva a `/friends`

### Requirement: Sin desborde horizontal

Todas las pantallas privadas DEBEN (MUST) caber en el ancho del viewport sin desplazamiento horizontal, desde 320 px hasta escritorio, con el panel abierto o cerrado.

#### Scenario: Pantalla estrecha

- **WHEN** la persona abre cualquier sección privada con un viewport de 320 a 1023 px
- **THEN** no hay desplazamiento horizontal y el contenido ocupa el ancho disponible

#### Scenario: Recorrido de todas las secciones

- **WHEN** se revisan Inicio, Búsqueda, Colección, Artistas, Novedades, Amigos, Historial y Ajustes a 320, 390 y 768 px
- **THEN** ninguna desplaza en horizontal ni recorta contenido por la derecha
