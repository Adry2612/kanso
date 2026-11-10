# Spec Delta

## ADDED Requirements

### Requirement: Género principal derivado

Al abrir el guardado de un álbum, el sistema DEBE (MUST) derivar de sus artistas una única rama principal de género, proponerla preseleccionada dentro del catálogo canónico y permitir cambiarla o dejarla vacía. El idioma NO DEBE (MUST NOT) derivarse de Spotify. Si Spotify falla, el guardado DEBE (MUST) continuar sin género.

#### Scenario: Rama principal propuesta

- **WHEN** la persona abre el guardado de un álbum con artistas que Spotify reconoce
- **THEN** el sistema preselecciona una sola rama principal, por ejemplo `hip-hop` para `latin hip hop` o `metal` para `metalcore`

#### Scenario: Cambio de la propuesta

- **WHEN** la persona prefiere otro género del catálogo
- **THEN** el sistema guarda el elegido y descarta el derivado

#### Scenario: Sin género derivado

- **WHEN** Spotify no devuelve géneros para los artistas o la consulta falla
- **THEN** el guardado continúa sin género y la persona puede elegirlo del catálogo

#### Scenario: Idioma no derivado

- **WHEN** se abre el guardado de un álbum
- **THEN** el idioma queda vacío hasta que la persona lo elija

## MODIFIED Requirements

### Requirement: Asistente de guardado en pasos

El sistema DEBE (MUST) pedir primero si el álbum va a la colección o a pendientes. Si elige la colección, DEBE guiar el guardado en tres pasos: emociones, actividades y una última fase con formato, idioma y género. Si elige pendientes, DEBE guardarlo sin recorrer esos pasos.

#### Scenario: Navegación entre pasos

- **WHEN** la persona avanza desde el paso de emociones
- **THEN** el sistema solicita actividades y después la fase de formato, idioma y género

#### Scenario: Formato obligatorio

- **WHEN** la persona intenta guardar sin ningún formato seleccionado
- **THEN** el sistema mantiene deshabilitada la acción de guardar

#### Scenario: Idioma y género opcionales

- **WHEN** la persona llega a la última fase sin elegir idioma ni género
- **THEN** el sistema permite guardar el álbum igualmente

#### Scenario: Destino pendientes

- **WHEN** la persona elige «Por escuchar» como destino
- **THEN** el sistema guarda el álbum en pendientes sin pedir emociones, actividades, formato, idioma ni género

#### Scenario: Destino colección

- **WHEN** la persona elige «A la colección» como destino
- **THEN** el sistema comienza el asistente por el paso de emociones

### Requirement: Etiquetas personales

El sistema DEBE (MUST) permitir elegir como máximo un idioma y un género principal por álbum, ambos opcionales, a partir del catálogo canónico, sin admitir texto libre. Las etiquetas DEBEN guardarse con su clave canónica y mostrarse traducidas.

#### Scenario: Elegir idioma y género

- **WHEN** la persona elige un idioma y un género en la última fase del asistente
- **THEN** el sistema guarda una etiqueta de cada eje con su clave canónica

#### Scenario: Añadir etiqueta

- **WHEN** la persona elige un idioma o un género del catálogo y confirma
- **THEN** el sistema añade la etiqueta sin duplicados, sin distinguir mayúsculas ni acentos

#### Scenario: Cambiar una elección

- **WHEN** la persona elige otro idioma o género para un álbum que ya tenía uno
- **THEN** el sistema sustituye el valor anterior en lugar de acumular dos

#### Scenario: Guardar sin etiquetas

- **WHEN** la persona no elige idioma ni género
- **THEN** el sistema guarda el álbum sin esas etiquetas

#### Scenario: Sin texto libre

- **WHEN** la persona busca un idioma o género que no está en el catálogo
- **THEN** el sistema no ofrece añadirlo y le muestra solo las opciones disponibles

### Requirement: Filtrado de la colección

El sistema DEBE (MUST) permitir filtrar la colección simultáneamente por emociones, géneros, idiomas, formatos y etiquetas de otras categorías. Los géneros y los idiomas DEBEN compararse por su clave canónica, sin depender del idioma de la interfaz.

#### Scenario: Filtro por emoción

- **WHEN** la persona activa una o más emociones
- **THEN** el sistema muestra solo los álbumes que contienen alguna de esas emociones

#### Scenario: Filtro por género

- **WHEN** la persona activa uno o más géneros
- **THEN** el sistema muestra solo los álbumes cuyo género principal coincide con alguno de los seleccionados

#### Scenario: Filtro por idioma

- **WHEN** la persona activa uno o más idiomas
- **THEN** el sistema muestra solo los álbumes cuyo idioma canónico coincide con alguno de los seleccionados

#### Scenario: Filtro combinado

- **WHEN** la persona combina varios tipos de filtro
- **THEN** el sistema muestra solo los álbumes que cumplen todos los filtros activos

#### Scenario: Limpiar filtros

- **WHEN** la persona pulsa "Limpiar filtros"
- **THEN** el sistema elimina todos los filtros y muestra la colección completa
