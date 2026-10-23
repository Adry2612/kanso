# Spec Delta

## MODIFIED Requirements

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

## ADDED Requirements

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
