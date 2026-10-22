# Spec Delta

## ADDED Requirements

### Requirement: Estado y gestión de pendientes en el detalle

El sistema DEBE indicar cuando un álbum está en pendientes y ofrecer pasarlo a la colección o quitarlo de pendientes, sin mostrarlo como parte de la colección ni exponer emociones, actividades, formatos o etiquetas inexistentes.

#### Scenario: Álbum pendiente

- **WHEN** la persona abre el detalle de un álbum que está en pendientes
- **THEN** el sistema muestra que está pendiente y ofrece las acciones de pasarlo a la colección y quitarlo de pendientes

#### Scenario: Pasar a la colección desde el detalle

- **WHEN** la persona elige pasar a la colección un álbum pendiente
- **THEN** el sistema abre el asistente de guardado con el destino colección seleccionado

#### Scenario: Quitar desde el detalle

- **WHEN** la persona elige quitar el álbum de pendientes
- **THEN** el sistema elimina la entrada y actualiza el detalle para reflejar que ya no está pendiente

#### Scenario: Álbum ya en la colección

- **WHEN** la persona abre el detalle de un álbum que ya está en su colección
- **THEN** el sistema mantiene el estado de colección y no ofrece añadirlo a pendientes
