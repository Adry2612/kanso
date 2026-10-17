# Búsqueda de álbumes

## Purpose

Permite buscar álbumes y artistas en Spotify desde la aplicación y explorar los resultados para añadirlos a la colección personal.

## Requirements

### Requirement: Búsqueda con retardo (debounce)

El sistema DEBE buscar en Spotify tras un retardo de 500 ms desde la última pulsación, sin realizar búsquedas mientras la consulta está vacía.

#### Scenario: Consulta efectiva

- **WHEN** la persona escribe una consulta y deja de escribir 500 ms
- **THEN** el sistema solicita resultados de álbumes y artistas a Spotify

#### Scenario: Consulta vacía

- **WHEN** la consulta está vacía
- **THEN** el sistema no realiza ninguna búsqueda y limpia los resultados y errores

### Requirement: Resultados de la búsqueda

El sistema DEBE mostrar los álbumes encontrados en una cuadrícula adaptable con portada, nombre y artistas.

#### Scenario: Resultados encontrados

- **WHEN** Spotify devuelve uno o más álbumes
- **THEN** el sistema muestra una cuadrícula de tarjetas de álbum con el título de resultados

#### Scenario: Sin resultados

- **WHEN** Spotify no devuelve álbumes para la consulta
- **THEN** el sistema muestra el mensaje de que no se encontraron álbumes

### Requirement: Identificación de favoritos en los resultados

El sistema DEBE indicar en cada tarjeta si el álbum ya forma parte de la colección del usuario.

#### Scenario: Álbum ya guardado

- **WHEN** un álbum del resultado existe en la colección del usuario
- **THEN** la tarjeta se muestra como ya añadida a la colección

#### Scenario: Álbum no guardado

- **WHEN** un álbum del resultado no existe en la colección del usuario
- **THEN** la tarjeta ofrece la acción de añadirlo a la colección

### Requirement: Estado vacío con sugerencias

El sistema DEBE mostrar, antes de buscar, sugerencias de búsqueda basadas en las emociones y etiquetas de la colección del usuario.

#### Scenario: Sugerencias desde la colección

- **WHEN** no hay búsqueda activa y el usuario tiene emociones o etiquetas guardadas
- **THEN** el sistema muestra chips de sugerencia que, al pulsarlos, establecen la consulta

### Requirement: Manejo de errores de búsqueda

El sistema DEBE informar cuando la búsqueda falla.

#### Scenario: Fallo de la API de búsqueda

- **WHEN** la petición de búsqueda responde con error
- **THEN** el sistema muestra el mensaje de error y no muestra resultados

### Requirement: Apertura del flujo de guardado

El sistema DEBE abrir el flujo de guardado al pulsar la acción de añadir de un resultado.

#### Scenario: Añadir desde resultados

- **WHEN** la persona pulsa "Añadir a mi colección" en una tarjeta
- **THEN** el sistema abre el modal de guardado para ese álbum
