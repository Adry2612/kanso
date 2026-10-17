# Spec Delta

## MODIFIED Requirements

### Requirement: Resultados de la búsqueda

El sistema DEBE mostrar los álbumes encontrados en una cuadrícula adaptable con portada, nombre y artistas.

#### Scenario: Resultados encontrados

- **WHEN** Spotify devuelve uno o más álbumes
- **THEN** el sistema muestra una cuadrícula de tarjetas de álbum con el título de resultados

#### Scenario: Sin resultados

- **WHEN** Spotify no devuelve álbumes para la consulta
- **THEN** el sistema muestra un estado vacío que explica que no hay resultados para esa búsqueda, ofrece limpiar la búsqueda y sugiere explorar la colección por emociones o etiquetas cuando existan

#### Scenario: Error de búsqueda frente a sin resultados

- **WHEN** la petición de búsqueda responde con error
- **THEN** el sistema muestra el mensaje de error y no el estado sin resultados
