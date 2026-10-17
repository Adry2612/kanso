# artist-discovery Specification

## Purpose
Permite descubrir artistas en Spotify, seguirlos como favoritos y explorar su discografía de álbumes y EPs sin ruido de singles ni compilaciones.

## Requirements

### Requirement: Búsqueda de artistas

El sistema DEBE permitir buscar artistas por nombre y mostrar los resultados con su imagen y su nombre.

#### Scenario: Resultados de artistas

- **WHEN** la persona escribe el nombre de un artista
- **THEN** el sistema muestra una lista de artistas con su imagen y su nombre

#### Scenario: Sin resultados de artistas

- **WHEN** la búsqueda de artistas no devuelve resultados
- **THEN** el sistema muestra un estado vacío para esa búsqueda

### Requirement: Artistas favoritos

El sistema DEBE permitir marcar y desmarcar un artista como favorito y mostrar la lista de artistas favoritos del usuario.

#### Scenario: Marcar un artista

- **WHEN** la persona marca un artista como favorito
- **THEN** el artista aparece en su lista de artistas favoritos y se conserva entre sesiones

#### Scenario: Desmarcar un artista

- **WHEN** la persona desmarca un artista favorito
- **THEN** el artista deja de aparecer en su lista de artistas favoritos

#### Scenario: Lista de artistas favoritos

- **WHEN** la persona abre `/artists`
- **THEN** el sistema muestra, junto al buscador, sus artistas favoritos guardados

### Requirement: Discografía de un artista

El sistema DEBE mostrar la discografía de un artista incluyendo solo álbumes y EPs, excluyendo singles, compilaciones y apariciones en trabajos de otros.

#### Scenario: Ver la discografía

- **WHEN** la persona abre la ficha de un artista
- **THEN** el sistema muestra sus álbumes y EPs, nunca singles, compilaciones ni apariciones

#### Scenario: Abrir un disco de la discografía

- **WHEN** la persona pulsa uno de los discos de la discografía
- **THEN** el sistema abre la ficha de ese álbum

#### Scenario: Artista sin álbumes ni EPs

- **WHEN** el artista no tiene álbumes ni EPs (solo singles)
- **THEN** el sistema muestra un estado vacío en la discografía
