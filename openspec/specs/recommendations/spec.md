# Recomendaciones

## Purpose

Genera sugerencias de álbumes a partir de la colección del usuario según su emoción o su actividad, con filtros de formato y etiquetas, y mantiene un historial de las recomendaciones recibidas.

## Requirements

### Requirement: Catálogo de emociones

El sistema DEBE ofrecer un catálogo de 15 emociones con etiqueta, emoji y símbolo, DEBE normalizar sinónimos y variantes a una clave canónica, y DEBE mostrarlas todas a la vez en el selector, sin paginar, con su emoji y una etiqueta legible en el tema activo.

#### Scenario: Emociones disponibles

- **WHEN** la persona abre el selector de emociones
- **THEN** el sistema muestra las 15 emociones del catálogo, todas visibles a la vez

#### Scenario: Normalización de sinónimos

- **WHEN** llega una emoción como texto libre o en otro idioma
- **THEN** el sistema la resuelve a su clave canónica o la descarta si no la reconoce

### Requirement: Catálogo de actividades

El sistema DEBE ofrecer un catálogo de 9 actividades —trabajar, estudiar, hacer ejercicio, cocinar, relajarse, jugar, desplazarse, tareas del hogar y fiesta— con etiqueta y emoji, y DEBE mostrarlas todas a la vez en el selector, sin paginar.

#### Scenario: Actividades disponibles

- **WHEN** la persona abre el selector de actividades
- **THEN** el sistema muestra las 9 actividades del catálogo, todas visibles a la vez

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

### Requirement: Recomendación por actividad

El sistema DEBE recomendar el álbum de la colección con mayor compatibilidad con las emociones asociadas a la actividad elegida.

#### Scenario: Compatibilidad por actividad

- **WHEN** la persona elige una actividad y genera la recomendación
- **THEN** el sistema calcula las emociones óptimas de esa actividad y devuelve el álbum con mayor puntuación de compatibilidad

#### Scenario: Colección vacía

- **WHEN** el usuario no tiene álbumes en la colección
- **THEN** el sistema no devuelve ninguna recomendación

### Requirement: Las recomendaciones provienen de la colección

El sistema DEBE basar las recomendaciones únicamente en los álbumes que el usuario ya tiene guardados.

#### Scenario: Álbumes no presentes

- **WHEN** se genera una recomendación
- **THEN** el sistema nunca propone álbumes que no estén en la colección del usuario

### Requirement: Registro automático en el historial

El sistema DEBE guardar automáticamente cada recomendación entregada en el historial del usuario con su álbum y emociones.

#### Scenario: Guardado de la recomendación

- **WHEN** el sistema entrega una recomendación
- **THEN** registra en `users/{uid}/recomendationHistory` el álbum y las emociones asociadas con la fecha de entrega

### Requirement: Historial de recomendaciones

El sistema DEBE mostrar el historial de recomendaciones agrupado por fecha, con la portada, el nombre, los artistas, la hora, las emociones y un enlace a Spotify.

#### Scenario: Historial con entradas

- **WHEN** el usuario abre su historial y tiene recomendaciones previas
- **THEN** el sistema las agrupa por fecha y muestra sus datos con acceso a Spotify

#### Scenario: Historial vacío

- **WHEN** el usuario no tiene recomendaciones previas
- **THEN** el sistema muestra el estado vacío del historial

### Requirement: Recomendaciones recientes en el inicio

El sistema DEBE mostrar hasta tres recomendaciones recientes en la pantalla de inicio con acceso a su detalle.

#### Scenario: Recomendaciones recientes disponibles

- **WHEN** el usuario abre el inicio y tiene recomendaciones previas
- **THEN** el sistema muestra hasta tres de las más recientes enlazando al detalle del álbum

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

### Requirement: Un único punto de entrada a la recomendación

La pantalla de inicio DEBE presentar una sola decisión principal —emoción o actividad— como vía dominante, y la recomendación rápida DEBE quedar como vía secundaria y visualmente subordinada, sin dos llamadas a la acción del mismo peso.

#### Scenario: Jerarquía clara

- **WHEN** la persona abre el inicio
- **THEN** ve un único panel principal para elegir emoción o actividad y, subordinada, la vía de recomendación rápida

#### Scenario: Recomendación rápida secundaria

- **WHEN** la persona elige la recomendación rápida
- **THEN** el sistema le pide solo formato o etiqueta y genera la recomendación sin pedir emociones
