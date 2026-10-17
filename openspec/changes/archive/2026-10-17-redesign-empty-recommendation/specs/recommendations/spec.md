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

- **WHEN** ninguna entrada de la colección coincide con la emoción elegida
- **THEN** el sistema muestra un estado vacío que explica que no hay álbumes para esa emoción, muestra las emociones elegidas y ofrece una llamada a la acción que lleva a la búsqueda para añadir un álbum que te haga sentir así

#### Scenario: Error técnico en la recomendación

- **WHEN** la recomendación falla por un error técnico o de red
- **THEN** el sistema muestra un mensaje de error diferenciado del estado sin coincidencias
