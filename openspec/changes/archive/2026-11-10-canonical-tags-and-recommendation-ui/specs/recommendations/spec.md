# Spec Delta

## ADDED Requirements

### Requirement: Selección canónica de etiquetas para recomendar

El sistema DEBE (MUST) mostrar las etiquetas disponibles para filtrar una recomendación con su nombre traducido y enviar su clave canónica, sin depender del idioma de la interfaz ni admitir texto libre.

#### Scenario: Etiqueta de género

- **WHEN** la persona elige la etiqueta de género `electronic` con la interfaz en español
- **THEN** la ve como «Electrónica» y la recomendación filtra por la clave `electronic`

#### Scenario: Etiqueta de idioma

- **WHEN** la persona elige la etiqueta de idioma `en`
- **THEN** la recomendación solo considera álbumes con idioma `en`, aunque la interfaz cambie de idioma

#### Scenario: Etiqueta heredada

- **WHEN** la colección conserva una etiqueta antigua como «Electrónica»
- **THEN** el sistema la reconoce como `electronic` y la ofrece igual que las canónicas

### Requirement: Resultado con la ficha completa

El resultado de una recomendación DEBE (MUST) usar la misma ficha que el detalle de un álbum de la colección: fondo derivado de la portada, volver, portada, título, artistas, descripción, acciones, lista de pistas y el panel «Mi disco» con emociones, actividades, formatos y etiquetas guardadas.

#### Scenario: Panel de datos guardados

- **WHEN** el álbum recomendado tiene emociones, actividades, formatos o etiquetas
- **THEN** el resultado muestra esas secciones en el mismo panel lateral que el detalle de la colección

#### Scenario: Álbum sin datos complementarios

- **WHEN** el álbum recomendado no tiene actividades, formatos ni etiquetas
- **THEN** el resultado muestra solo las secciones con datos, sin huecos vacíos

#### Scenario: Acciones propias de la recomendación

- **WHEN** se muestra el resultado
- **THEN** las acciones son abrir en Spotify y valorar la recomendación, sin ofrecer editar o eliminar el álbum

#### Scenario: Misma estructura en cualquier procedencia

- **WHEN** la recomendación llega por emoción, por actividad o por la vía rápida
- **THEN** el resultado presenta la misma estructura de ficha y panel

### Requirement: Carga de la recomendación a pantalla completa

Mientras se calcula una recomendación, el sistema DEBE (MUST) mostrar la animación de vinilos centrada en la pantalla junto a un mensaje que explique que se está preparando la recomendación. NO DEBE (MUST NOT) colocar la animación dentro del espacio reservado a la portada ni mostrar esqueletos que simulen la ficha del álbum.

#### Scenario: Cálculo en curso

- **WHEN** la persona espera el resultado de una recomendación
- **THEN** ve la animación centrada y un mensaje de que se está buscando un disco para ese momento

#### Scenario: Anuncio accesible

- **WHEN** la carga comienza
- **THEN** el estado se anuncia como ocupado y el mensaje está disponible para tecnologías de asistencia

#### Scenario: Movimiento reducido

- **WHEN** el sistema operativo indica movimiento reducido
- **THEN** la animación queda estática y el mensaje sigue visible

#### Scenario: Fin de la carga

- **WHEN** la recomendación termina de cargar o falla
- **THEN** el estado de carga desaparece y se muestra el resultado, el estado sin coincidencias o el error correspondiente
