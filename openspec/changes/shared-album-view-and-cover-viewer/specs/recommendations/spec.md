# Spec Delta

## ADDED Requirements

### Requirement: Ficha de álbum compartida en el resultado

El resultado de una recomendación DEBE (MUST) presentar la misma ficha que el detalle de álbum: fondo derivado de la portada, acción de volver, portada, título, artistas, descripción y tracklist. DEBE (MUST) conservar además el resumen de filtros, las emociones recomendadas y el botón de Spotify, y NO DEBE (MUST NOT) mostrar las acciones de colección ni el panel de datos guardados.

#### Scenario: Misma ficha que el detalle

- **WHEN** la persona recibe una recomendación
- **THEN** ve la portada, el título, los artistas y el tracklist con la misma estructura y jerarquía que en el detalle de álbum

#### Scenario: Fondo derivado de la portada

- **WHEN** la recomendación muestra un álbum con portada
- **THEN** el fondo usa un degradado derivado de su color dominante, igual que en el detalle

#### Scenario: Tracklist compartido

- **WHEN** la recomendación tiene pistas disponibles
- **THEN** se muestran numeradas con su nombre y artistas usando el mismo bloque de tracklist que el detalle, incluido su mensaje cuando no hay pistas

#### Scenario: Contexto propio de la recomendación

- **WHEN** la recomendación se generó con emociones, actividad, formato o etiquetas
- **THEN** se mantienen el resumen de filtros, las emociones recomendadas y el botón de Spotify

#### Scenario: Sin acciones de colección

- **WHEN** la persona ve el resultado de una recomendación
- **THEN** no aparecen las acciones de añadir, editar o eliminar de la colección ni el panel de datos guardados

#### Scenario: Estados de carga, error y sin coincidencias

- **WHEN** la recomendación está cargando, falla o no encuentra un álbum
- **THEN** se mantienen los estados correspondientes que ya existen, sin adoptar la ficha de un álbum inexistente
