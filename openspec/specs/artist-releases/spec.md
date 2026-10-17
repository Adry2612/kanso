# artist-releases Specification

## Purpose
Reúne las novedades (lanzamientos recientes) de los artistas que el usuario sigue y las presenta en una página para descubrir qué escuchar nuevo.

## Requirements

### Requirement: Novedades de los artistas seguidos

El sistema DEBE devolver las novedades recientes de los artistas que el usuario sigue, agregadas desde Spotify, sin guardar ningún identificador de usuario en la caché.

#### Scenario: Artistas seguidos con novedades

- **WHEN** el usuario sigue uno o más artistas y alguno tiene lanzamientos recientes
- **THEN** el sistema devuelve esos lanzamientos ordenados por fecha de lanzamiento descendente

#### Scenario: Sin artistas seguidos

- **WHEN** el usuario no sigue a ningún artista
- **THEN** el sistema devuelve una lista vacía sin consultar Spotify

#### Scenario: Sin novedades en la ventana

- **WHEN** los artistas seguidos no tienen lanzamientos dentro de la ventana temporal
- **THEN** el sistema devuelve una lista vacía

### Requirement: Ventana temporal de las novedades

El sistema DEBE incluir solo los lanzamientos publicados dentro de los últimos 60 días respecto a la fecha actual.

#### Scenario: Lanzamiento reciente incluido

- **WHEN** un artista seguido publicó un disco hace menos de 60 días
- **THEN** el lanzamiento aparece en las novedades

#### Scenario: Lanzamiento antiguo excluido

- **WHEN** el único lanzamiento de un artista seguido tiene más de 60 días
- **THEN** ese lanzamiento no aparece en las novedades

### Requirement: Solo lanzamientos publicados

El sistema DEBE incluir únicamente lanzamientos ya publicados. Quedan fuera de alcance los lanzamientos futuros (pre-venta o pre-save): la API pública de Spotify no los expone de forma descubrible —existen en el catálogo y se pueden leer por identificador, pero no aparecen en la discografía del artista, en la búsqueda ni en las novedades— y ninguna fuente pública (MusicBrainz, Wikidata, Deezer, Apple/iTunes) permite resolver su identificador de Spotify.

#### Scenario: Lanzamiento anunciado con fecha futura

- **WHEN** un artista tiene un lanzamiento anunciado (pre-save) con fecha de publicación futura
- **THEN** no aparece en las novedades hasta que se publica

### Requirement: Contenido incluido y excluido

El sistema DEBE incluir álbumes, EPs y singles del propio artista y DEBE excluir compilaciones y apariciones en trabajos de otros.

#### Scenario: Álbum, EP o single propio

- **WHEN** el artista publicó un álbum, un EP o un single dentro de la ventana
- **THEN** el lanzamiento aparece en las novedades

#### Scenario: Compilación o aparición

- **WHEN** el lanzamiento es una compilación o una aparición en un trabajo de otro artista
- **THEN** no aparece en las novedades

#### Scenario: Sin duplicados

- **WHEN** un mismo lanzamiento aparece en los resultados de más de un artista seguido (colaboración)
- **THEN** el sistema lo muestra una sola vez

### Requirement: Página de novedades

El sistema DEBE mostrar las novedades en la página `/releases`, agrupadas por mes y ordenadas de más reciente a más antigua, con portada, nombre, artista, fecha y tipo de lanzamiento.

#### Scenario: Agrupación por mes

- **WHEN** hay novedades de varios meses
- **THEN** el sistema las agrupa por mes, del más reciente al más antiguo

#### Scenario: Abrir un lanzamiento

- **WHEN** la persona pulsa un lanzamiento de las novedades
- **THEN** el sistema abre la ficha de ese álbum

#### Scenario: Sin novedades

- **WHEN** no hay novedades que mostrar
- **THEN** el sistema muestra un estado vacío que invita a seguir a artistas para ver sus novedades

### Requirement: Caché de novedades

El sistema DEBE cachear las novedades por artista con una vigencia de 24 horas para no repetir llamadas a Spotify, y DEBE degradar sin bloquear la página cuando una consulta falla.

#### Scenario: Caché vigente

- **WHEN** las novedades de un artista se consultaron hace menos de 24 horas
- **THEN** el sistema las sirve desde la caché sin llamar a Spotify

#### Scenario: Caché caducada

- **WHEN** las novedades de un artista se consultaron hace más de 24 horas o no existen
- **THEN** el sistema las vuelve a consultar en Spotify y actualiza la caché

#### Scenario: Fallo al consultar un artista

- **WHEN** la consulta a Spotify de un artista falla
- **THEN** el sistema continúa con el resto de artistas y no bloquea la página
