# Recomendaciones

## Purpose

Genera sugerencias de álbumes a partir de la colección del usuario según su emoción o su actividad, con filtros de formato y etiquetas, y mantiene un historial de las recomendaciones recibidas.

## Requirements

### Requirement: Catálogo de emociones

El sistema DEBE ofrecer un catálogo de 15 emociones con etiqueta, emoji y símbolo, y normalizar sinónimos y variantes a una clave canónica.

#### Scenario: Emociones disponibles

- **WHEN** la persona abre el selector de emociones
- **THEN** el sistema muestra las 15 emociones del catálogo

#### Scenario: Normalización de sinónimos

- **WHEN** llega una emoción como texto libre o en otro idioma
- **THEN** el sistema la resuelve a su clave canónica o la descarta si no la reconoce

### Requirement: Catálogo de actividades

El sistema DEBE ofrecer un catálogo de 9 actividades: trabajar, estudiar, hacer ejercicio, cocinar, relajarse, jugar, desplazarse, tareas del hogar y fiesta.

#### Scenario: Actividades disponibles

- **WHEN** la persona abre el selector de actividades
- **THEN** el sistema muestra las 9 actividades del catálogo

### Requirement: Recomendación por emoción

El sistema DEBE recomendar un álbum aleatorio de la colección del usuario que coincida con las emociones seleccionadas, aplicando opcionalmente filtros de formato y etiquetas.

#### Scenario: Coincidencia por emoción

- **WHEN** la persona selecciona una o más emociones y genera la recomendación
- **THEN** el sistema devuelve un álbum de su colección etiquetado con alguna de esas emociones

#### Scenario: Filtro por formato

- **WHEN** la persona limita el formato a vinilo, CD o casete
- **THEN** el sistema solo tiene en cuenta álbumes con ese formato

#### Scenario: Sin coincidencias

- **WHEN** ninguna entrada de la colección coincide con la selección
- **THEN** el sistema muestra un mensaje de que no se encontraron álbumes

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
