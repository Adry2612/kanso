# Spec Delta

## MODIFIED Requirements

### Requirement: Listado de la colección

El sistema DEBE listar los álbumes guardados del usuario con sus datos de álbum, emociones, actividades y formatos, ordenados del más reciente al más antiguo, sin mostrar las etiquetas personales en las tarjetas.

#### Scenario: Colección con álbumes

- **WHEN** el usuario abre su colección y tiene álbumes guardados
- **THEN** el sistema los muestra del más reciente al más antiguo junto con los datos del álbum

#### Scenario: Etiquetas ocultas en las tarjetas

- **WHEN** la persona ve las tarjetas de su colección
- **THEN** las tarjetas no muestran las etiquetas personales de cada álbum

#### Scenario: Colección vacía

- **WHEN** el usuario no tiene álbumes guardados
- **THEN** el sistema muestra el estado vacío y un acceso a la búsqueda
