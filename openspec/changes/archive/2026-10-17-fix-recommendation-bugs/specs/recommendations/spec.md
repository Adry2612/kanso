# Spec Delta

## MODIFIED Requirements

### Requirement: Recomendación por emoción

El sistema DEBE recomendar un álbum aleatorio de la colección del usuario que coincida con las emociones seleccionadas, aplicando opcionalmente filtros de formato y etiquetas.

#### Scenario: Coincidencia por emoción

- **WHEN** la persona selecciona una o más emociones y genera la recomendación
- **THEN** el sistema devuelve un álbum de su colección etiquetado con alguna de esas emociones

#### Scenario: Filtro por formato

- **WHEN** la persona limita el formato a vinilo, CD o casete
- **THEN** el sistema solo tiene en cuenta álbumes con ese formato

#### Scenario: Filtro por etiquetas

- **WHEN** la persona activa una o más etiquetas de su colección
- **THEN** el sistema solo tiene en cuenta álbumes que contienen alguna de esas etiquetas, sin distinguir mayúsculas de minúsculas

#### Scenario: Sin coincidencias

- **WHEN** ninguna entrada de la colección coincide con la selección
- **THEN** el sistema muestra un mensaje de que no se encontraron álbumes

### Requirement: Acceso al detalle desde la recomendación

El sistema DEBE permitir abrir el álbum recomendado y escucharlo en Spotify desde el resultado.

#### Scenario: Ver el álbum recomendado

- **WHEN** la persona pulsa sobre la recomendación
- **THEN** el sistema la lleva al detalle del álbum con su lista de pistas

#### Scenario: Escuchar en Spotify desde el resultado

- **WHEN** la persona pulsa "Escuchar en Spotify" en el resultado de la recomendación
- **THEN** el sistema abre el álbum en Spotify

#### Scenario: Álbum sin enlace de Spotify

- **WHEN** el álbum recomendado no tiene un enlace de Spotify disponible
- **THEN** el sistema no lanza ningún error al intentar escucharlo
