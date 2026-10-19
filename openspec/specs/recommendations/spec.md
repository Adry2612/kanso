# Recomendaciones

## Purpose

Genera sugerencias de álbumes a partir de la colección del usuario según su emoción o su actividad, con filtros de formato y etiquetas, y mantiene un historial de las recomendaciones recibidas.

## Requirements

### Requirement: Catálogo de emociones

El sistema DEBE ofrecer un catálogo de 15 emociones con etiqueta, emoji y símbolo, DEBE normalizar sinónimos y variantes a una clave canónica, y DEBE presentarlas en un carrusel interactivo en el que las 15 son alcanzables tanto con el puntero (arrastre, rueda o flechas) como con el teclado, con su emoji y una etiqueta legible en el tema activo. DEBE permitir además filtrar las opciones por su etiqueta escrita.

#### Scenario: Emociones disponibles

- **WHEN** la persona abre el selector de emociones
- **THEN** el sistema muestra las 15 emociones del catálogo en el carrusel y todas son alcanzables, sin que ninguna quede fuera de acceso por puntero o por teclado

#### Scenario: Filtro por texto

- **WHEN** la persona escribe parte del nombre de una emoción en el buscador del carrusel
- **THEN** el sistema muestra solo las emociones cuya etiqueta coincide, ignorando acentos y mayúsculas, y le indica cuántas coinciden

#### Scenario: Filtro sin coincidencias

- **WHEN** la búsqueda no coincide con ninguna emoción
- **THEN** el sistema muestra un mensaje que lo indica y ofrece limpiar la búsqueda, sin perder las emociones ya seleccionadas

#### Scenario: Normalización de sinónimos

- **WHEN** llega una emoción como texto libre o en otro idioma
- **THEN** el sistema la resuelve a su clave canónica o la descarta si no la reconoce

### Requirement: Catálogo de actividades

El sistema DEBE ofrecer un catálogo de 9 actividades —trabajar, estudiar, hacer ejercicio, cocinar, relajarse, jugar, desplazarse, tareas del hogar y fiesta— con etiqueta y emoji, y DEBE presentarlas en el mismo carrusel interactivo que las emociones, con las 9 alcanzables por puntero y por teclado, y con el mismo filtro por texto.

#### Scenario: Actividades disponibles

- **WHEN** la persona abre el selector de actividades
- **THEN** el sistema muestra las 9 actividades del catálogo en el carrusel y todas son alcanzables

#### Scenario: Filtro de actividades

- **WHEN** la persona escribe parte del nombre de una actividad en el buscador
- **THEN** el sistema muestra solo las actividades que coinciden y mantiene la actividad elegida

### Requirement: Carrusel accesible de emociones y actividades

El sistema DEBE presentar la elección de emoción o actividad como un carrusel interactivo recorrible con el puntero (arrastre, rueda o flechas) y con el teclado (flechas, Inicio y Fin), DEBE anunciar la opción enfocada a las tecnologías de asistencia, DEBE indicar la selección sin depender únicamente del color y NO DEBE rotar de forma automática.

#### Scenario: Navegación por teclado

- **WHEN** la persona recorre el carrusel con el teclado
- **THEN** puede moverse entre las opciones con las flechas y saltar al principio o al final con Inicio y Fin, con un foco visible en todo momento

#### Scenario: Recorrido con puntero

- **WHEN** la persona arrastra, usa la rueda o pulsa las flechas del carrusel
- **THEN** el carrusel se desplaza entre las opciones y cada una puede alcanzarse

#### Scenario: Controles del carrusel agrupados

- **WHEN** el carrusel se muestra
- **THEN** sus flechas de navegación aparecen centradas bajo el carril, sin superponerse a ninguna opción

#### Scenario: Etiquetas alineadas

- **WHEN** dos opciones tienen nombres de distinta longitud
- **THEN** sus medallones y sus etiquetas mantienen la misma línea base, sin desalinearse

#### Scenario: Selección perceptible

- **WHEN** la persona selecciona una opción
- **THEN** el sistema la marca de forma perceptible sin depender solo del color

#### Scenario: Sin rotación automática

- **WHEN** el carrusel se muestra
- **THEN** permanece quieto hasta que la persona interactúa, sin avanzar solo

#### Scenario: Movimiento reducido

- **WHEN** el sistema operativo indica movimiento reducido
- **THEN** el desplazamiento del carrusel es instantáneo o estático, sin animación

### Requirement: Marca unificada de emociones y actividades

El sistema DEBE identificar cada emoción y actividad con la misma marca —un medallón que contiene el emoji del catálogo— en el inicio, en el filtro de la colección y en el modal de guardar álbum, con contraste suficiente en ambos temas.

#### Scenario: Misma marca en toda la aplicación

- **WHEN** la persona ve una emoción o actividad en el inicio, en el filtro o al guardar un álbum
- **THEN** reconoce el mismo medallón con el mismo emoji en los tres sitios

#### Scenario: Contraste en ambos temas

- **WHEN** la marca se muestra sobre el tema claro o el oscuro
- **THEN** su etiqueta y su medallón mantienen un contraste legible

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

### Requirement: Recomendación desde el carrusel

El sistema DEBE permitir generar la recomendación del disco a partir de la emoción o la actividad elegida en el carrusel, aplicando opcionalmente el formato físico y las etiquetas, y DEBE llevar al resultado de la recomendación.

#### Scenario: Recomendar tras elegir una emoción

- **WHEN** la persona elige una o más emociones en el carrusel y confirma
- **THEN** el sistema genera la recomendación y muestra el resultado

#### Scenario: Recomendar tras elegir una actividad

- **WHEN** la persona elige una actividad en el carrusel y confirma
- **THEN** el sistema calcula las emociones óptimas de esa actividad y muestra el álbum recomendado

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
