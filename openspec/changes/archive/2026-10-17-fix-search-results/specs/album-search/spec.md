# Spec Delta

## MODIFIED Requirements

### Requirement: Resultados de la búsqueda

El sistema DEBE mostrar los álbumes encontrados en una cuadrícula adaptable con portada, nombre y artistas, y DEBE hacerlos visibles en cuanto aparecen, sin que la animación de entrada pueda dejarlos ocultos. El sistema DEBE tratar como error cualquier respuesta que no sea un resultado válido de Spotify, y DEBE distinguir ese error del estado sin resultados.

#### Scenario: Resultados encontrados

- **WHEN** Spotify devuelve uno o más álbumes
- **THEN** el sistema muestra una cuadrícula de tarjetas de álbum con el título de resultados

#### Scenario: Resultados visibles al aparecer

- **WHEN** los resultados de una búsqueda aparecen en pantalla
- **THEN** las tarjetas son visibles aunque la pestaña no esté en primer plano o el contenido ya estuviera en pantalla

#### Scenario: Sin resultados

- **WHEN** Spotify no devuelve álbumes para la consulta
- **THEN** el sistema muestra un estado vacío que explica que no hay resultados para esa búsqueda, ofrece limpiar la búsqueda y sugiere explorar la colección por emociones o etiquetas cuando existan

#### Scenario: Error de búsqueda frente a sin resultados

- **WHEN** la petición de búsqueda responde con error
- **THEN** el sistema muestra el mensaje de error y no el estado sin resultados

#### Scenario: Respuesta inválida del proveedor

- **WHEN** Spotify responde con un error (por ejemplo, límite de peticiones) y el sistema lo recibe
- **THEN** el sistema responde con error y la búsqueda muestra un error en lugar del estado sin resultados
