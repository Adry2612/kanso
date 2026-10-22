# Spec Delta

## MODIFIED Requirements

### Requirement: Asistente de guardado en pasos

El sistema DEBE pedir primero si el álbum va a la colección o a pendientes. Si elige la colección, DEBE guiar el guardado en tres pasos: emociones, actividades y formato. Si elige pendientes, DEBE guardarlo sin recorrer esos pasos.

#### Scenario: Navegación entre pasos

- **WHEN** la persona avanza desde el paso de emociones
- **THEN** el sistema solicita actividades y después el formato de colección

#### Scenario: Formato obligatorio

- **WHEN** la persona intenta guardar sin ningún formato seleccionado
- **THEN** el sistema mantiene deshabilitada la acción de guardar

#### Scenario: Destino pendientes

- **WHEN** la persona elige «Por escuchar» como destino
- **THEN** el sistema guarda el álbum en pendientes sin pedir emociones, actividades, formato ni etiquetas

#### Scenario: Destino colección

- **WHEN** la persona elige «A la colección» como destino
- **THEN** el sistema comienza el asistente por el paso de emociones
