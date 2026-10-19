# Spec Delta

## MODIFIED Requirements

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

## ADDED Requirements

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

### Requirement: Recomendación desde el carrusel

El sistema DEBE permitir generar la recomendación del disco a partir de la emoción o la actividad elegida en el carrusel, aplicando opcionalmente el formato físico y las etiquetas, y DEBE llevar al resultado de la recomendación.

#### Scenario: Recomendar tras elegir una emoción

- **WHEN** la persona elige una o más emociones en el carrusel y confirma
- **THEN** el sistema genera la recomendación y muestra el resultado

#### Scenario: Recomendar tras elegir una actividad

- **WHEN** la persona elige una actividad en el carrusel y confirma
- **THEN** el sistema calcula las emociones óptimas de esa actividad y muestra el álbum recomendado
