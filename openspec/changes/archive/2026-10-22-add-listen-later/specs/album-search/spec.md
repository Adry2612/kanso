# Spec Delta

## MODIFIED Requirements

### Requirement: Identificación de favoritos en los resultados

El sistema DEBE indicar en cada tarjeta si el álbum ya forma parte de la colección o está en pendientes; si no está guardado, DEBE ofrecer la acción de añadirlo a la colección.

#### Scenario: Álbum ya guardado

- **WHEN** un álbum del resultado existe en la colección del usuario
- **THEN** la tarjeta se muestra como ya añadida a la colección

#### Scenario: Álbum pendiente

- **WHEN** un álbum del resultado está en pendientes
- **THEN** la tarjeta se muestra como pendiente y no como parte de la colección

#### Scenario: Álbum no guardado

- **WHEN** un álbum del resultado no existe ni en la colección ni en pendientes
- **THEN** la tarjeta ofrece la acción de añadirlo a la colección

## ADDED Requirements

### Requirement: Gestión de pendientes desde los resultados

El sistema DEBE abrir las acciones de un álbum pendiente desde su tarjeta y ofrecer pasarlo a la colección o quitarlo de pendientes.

#### Scenario: Abrir acciones de pendiente

- **WHEN** la persona pulsa la acción de un álbum pendiente en los resultados
- **THEN** el sistema muestra las opciones de pasarlo a la colección o quitarlo de pendientes

#### Scenario: Pasar a la colección desde resultados

- **WHEN** la persona elige pasar a la colección un álbum pendiente
- **THEN** el sistema abre el asistente de guardado con el destino colección seleccionado

#### Scenario: Quitar desde resultados

- **WHEN** la persona elige quitar un álbum de pendientes
- **THEN** el sistema elimina la entrada y actualiza la tarjeta para reflejar que ya no está pendiente
