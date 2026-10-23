# Búsqueda de álbumes

## Purpose

Permite buscar álbumes y artistas en Spotify desde la aplicación y explorar los resultados para añadirlos a la colección personal.

## Requirements

### Requirement: Búsqueda con retardo (debounce)

El sistema DEBE buscar en Spotify tras un retardo de 500 ms desde la última pulsación, sin realizar búsquedas mientras la consulta está vacía. Al iniciar una búsqueda nueva, el sistema DEBE cancelar la petición anterior que siga en curso para no mostrar resultados obsoletos.

#### Scenario: Consulta efectiva

- **WHEN** la persona escribe una consulta y deja de escribir 500 ms
- **THEN** el sistema solicita resultados de álbumes y artistas a Spotify

#### Scenario: Consulta vacía

- **WHEN** la consulta está vacía o solo contiene espacios
- **THEN** el sistema no realiza ninguna búsqueda y limpia los resultados y errores

#### Scenario: Escritura rápida sin resultados obsoletos

- **WHEN** la consulta cambia antes de que llegue la respuesta de la búsqueda anterior
- **THEN** el sistema descarta la respuesta anterior y muestra solo los resultados de la consulta más reciente

### Requirement: Resultados de la búsqueda

El sistema DEBE (MUST) mostrar los álbumes encontrados en una cuadrícula adaptable con portada, nombre y artistas, y DEBE hacerlos visibles en cuanto aparecen, sin que la animación de entrada pueda dejarlos ocultos. El sistema DEBE tratar como error cualquier respuesta que no sea un resultado válido de Spotify, y DEBE distinguir ese error del estado sin resultados.

#### Scenario: Resultados encontrados

- **WHEN** Spotify devuelve uno o más álbumes
- **THEN** el sistema muestra una cuadrícula de tarjetas de álbum con el título de resultados

#### Scenario: Resultados visibles al aparecer

- **WHEN** los resultados de una búsqueda aparecen en pantalla
- **THEN** las tarjetas son visibles aunque la pestaña no esté en primer plano o el contenido ya estuviera en pantalla

#### Scenario: Sin álbumes pero con artistas

- **WHEN** Spotify no devuelve álbumes pero sí artistas
- **THEN** el sistema muestra la sección de artistas y un mensaje de que no se encontraron álbumes para esa búsqueda

#### Scenario: Sin resultados

- **WHEN** Spotify no devuelve ni álbumes ni artistas para la consulta
- **THEN** el sistema muestra un estado vacío que explica que no hay resultados para esa búsqueda, ofrece limpiar la búsqueda y sugiere explorar la colección por emociones o etiquetas cuando existan

#### Scenario: Error de búsqueda frente a sin resultados

- **WHEN** la petición de búsqueda responde con error
- **THEN** el sistema muestra el mensaje de error y no el estado sin resultados

#### Scenario: Respuesta inválida del proveedor

- **WHEN** Spotify responde con un error (por ejemplo, límite de peticiones) y el sistema lo recibe
- **THEN** el sistema responde con error y la búsqueda muestra un error en lugar del estado sin resultados

### Requirement: Artistas en los resultados de búsqueda

El sistema DEBE (MUST) mostrar una sección de artistas cuando la respuesta de búsqueda incluya artistas, con su imagen y su nombre, y cada artista DEBE enlazar a su ficha. Si la respuesta no incluye artistas, la sección no se muestra.

#### Scenario: Sección de artistas

- **WHEN** la respuesta de búsqueda incluye uno o más artistas
- **THEN** el sistema muestra una sección de artistas junto a los álbumes

#### Scenario: Artista navegable

- **WHEN** la persona pulsa un artista de la sección
- **THEN** el sistema abre la ficha de ese artista

#### Scenario: Sin artistas

- **WHEN** la respuesta de búsqueda no incluye artistas
- **THEN** el sistema no muestra la sección de artistas

### Requirement: Prioridad del artista exacto

Cuando la consulta normalizada coincida exactamente con el nombre de un artista del resultado, sin distinguir mayúsculas, tildes ni espacios sobrantes, el sistema DEBE (MUST) priorizar a ese artista y devolver sus álbumes y singles, excluyendo recopilatorios y coincidencias solo por título. Sin coincidencia exacta, DEBE mantener los resultados generales.

#### Scenario: Consulta con nombre de artista

- **WHEN** la persona busca el nombre exacto de un artista
- **THEN** ese artista aparece primero y los álbumes mostrados son suyos, sin recopilatorios ni discos que solo coinciden por título

#### Scenario: Normalización de la consulta

- **WHEN** la consulta coincide con un artista ignorando mayúsculas, tildes o espacios sobrantes
- **THEN** el sistema aplica la misma prioridad que con una coincidencia exacta literal

#### Scenario: Sin coincidencia exacta de artista

- **WHEN** la consulta no coincide exactamente con el nombre de ningún artista del resultado
- **THEN** el sistema mantiene los resultados generales de álbumes y artistas

#### Scenario: Artista sin álbumes disponibles

- **WHEN** el artista coincide pero no se encuentran álbumes suyos en el catálogo
- **THEN** el sistema mantiene los álbumes generales como respaldo y sigue mostrando al artista

#### Scenario: Fallo al consultar la discografía del artista

- **WHEN** falla la consulta específica de álbumes del artista exacto
- **THEN** el sistema mantiene los resultados generales y no muestra el estado de error de búsqueda

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
