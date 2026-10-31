# Spec Delta

## MODIFIED Requirements

### Requirement: Recomendación por emoción

El sistema DEBE (MUST) recomendar un álbum de la colección que coincida con al menos una de las emociones seleccionadas, ordenando los candidatos por proporción de emociones coincidentes, penalización por recencia y valoración previa, y aplicando opcionalmente filtros de formato y etiquetas. La selección final DEBE (MUST) hacerse entre los tres candidatos con mayor puntuación. Si ningún álbum coincide, DEBE (MUST) mostrar el estado sin coincidencias.

#### Scenario: Coincidencia por emoción

- **WHEN** la persona selecciona una o más emociones y genera la recomendación
- **THEN** el sistema devuelve un álbum de su colección etiquetado con alguna de esas emociones y descarta los que no tienen ninguna coincidencia

#### Scenario: Más coincidencias, mejor posición

- **WHEN** dos álbumes coinciden con emociones distintas de las pedidas
- **THEN** el que coincide en una proporción mayor queda mejor puntuado, antes de aplicar recencia y valoración

#### Scenario: Recencia y valoración ajustan el orden

- **WHEN** dos álbumes tienen la misma proporción de emociones coincidentes
- **THEN** la penalización por recencia y la valoración previa deciden cuál queda por delante

#### Scenario: Selección entre los tres mejores

- **WHEN** hay tres o más candidatos con coincidencia
- **THEN** el sistema elige uno al azar entre los tres mejor puntuados para evitar repetir siempre el mismo disco

#### Scenario: Filtro por formato

- **WHEN** la persona limita el formato a vinilo, CD o casete
- **THEN** el sistema solo tiene en cuenta álbumes con ese formato

#### Scenario: Filtro por etiquetas

- **WHEN** la persona activa una o más etiquetas de su colección
- **THEN** el sistema solo tiene en cuenta álbumes que contienen alguna de esas etiquetas, sin distinguir mayúsculas de minúsculas

#### Scenario: Sin coincidencias

- **WHEN** la colección está vacía o ningún álbum supera los filtros con al menos una emoción coincidente
- **THEN** el sistema muestra un estado vacío que explica que no hay álbumes disponibles y ofrece una llamada a la acción que lleva a la búsqueda

#### Scenario: Error técnico en la recomendación

- **WHEN** la recomendación falla por un error técnico o de red
- **THEN** el sistema muestra un mensaje de error diferenciado del estado sin coincidencias

## ADDED Requirements

### Requirement: Penalización por recencia

Los álbumes recomendados en las últimas 10 recomendaciones DEBEN (MUST) bajar de peso de forma decreciente según su antigüedad, sin quedar excluidos de la selección.

#### Scenario: Álbum recomendado hace poco

- **WHEN** un álbum aparece entre las últimas 10 recomendaciones
- **THEN** su puntuación se reduce y más cuanto más reciente es

#### Scenario: Álbum sin recomendación reciente

- **WHEN** un álbum no está entre las últimas 10 recomendaciones
- **THEN** no recibe penalización por recencia

#### Scenario: Sin historial previo

- **WHEN** la persona no tiene historial de recomendaciones
- **THEN** no se aplica ninguna penalización

### Requirement: Valoración de la recomendación

Después de mostrar una recomendación, el sistema DEBE (MUST) ofrecer un control junto a las acciones principales para indicar si gustó o no, DEBE (MUST) guardar la valoración y DEBE (MUST) usarla para ajustar futuras recomendaciones de ese álbum y de los de emociones principales similares.

#### Scenario: Marcar que gustó

- **WHEN** la persona indica que la recomendación le gustó
- **THEN** el sistema guarda la valoración y sube el peso de ese álbum y de los de emociones principales similares

#### Scenario: Marcar que no gustó

- **WHEN** la persona indica que la recomendación no le gustó
- **THEN** el sistema guarda la valoración y baja el peso de ese álbum y de los de emociones principales similares

#### Scenario: Valoración sustituida

- **WHEN** la persona valora de nuevo un álbum ya valorado
- **THEN** la valoración previa se sustituye, sin acumularse

#### Scenario: Control junto a las acciones

- **WHEN** se muestra el resultado de la recomendación
- **THEN** el control de valoración aparece junto al botón de Spotify

### Requirement: Emociones y actividades del álbum en la recomendación

El resultado DEBE (MUST) mostrar las emociones y actividades que la persona indicó para el álbum recomendado, en modo lectura y sin control para editarlas. NO DEBE (MUST NOT) mostrar acciones de edición de emociones en esa pantalla.

#### Scenario: Mostrar etiquetas y actividades

- **WHEN** el álbum recomendado tiene emociones o actividades guardadas
- **THEN** el resultado las muestra como etiquetas de solo lectura

#### Scenario: Sin etiquetas

- **WHEN** el álbum recomendado no tiene emociones ni actividades
- **THEN** esa sección no se muestra, sin romper la ficha
