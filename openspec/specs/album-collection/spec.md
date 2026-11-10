# Colección de álbumes

## Purpose

Permite guardar álbumes en una colección personal con emociones, actividades, formato y etiquetas, y explorarla con ordenaciones, filtros y agrupaciones.

## Requirements

### Requirement: Guardar un álbum en la colección

El sistema DEBE guardar un álbum para el usuario con sus emociones, actividades, formatos y etiquetas asociados.

#### Scenario: Guardado correcto

- **WHEN** la persona completa el asistente y pulsa "Guardar álbum"
- **THEN** el sistema registra el álbum en `users/{uid}/favorites` con emociones, actividades, formatos y etiquetas, y confirma el guardado

#### Scenario: Álbum ya guardado

- **WHEN** la persona guarda un álbum que ya estaba en su colección
- **THEN** el sistema actualiza los datos existentes en lugar de crear un duplicado

### Requirement: Validación de formato de colección

El sistema DEBE aceptar únicamente los formatos `digital`, `cd`, `cassette` y `vinyl`, sin duplicados.

#### Scenario: Formato válido

- **WHEN** la persona selecciona uno o varios formatos permitidos
- **THEN** el sistema los almacena normalizados y sin duplicados

#### Scenario: Formato inválido

- **WHEN** la petición incluye un formato no permitido
- **THEN** el sistema responde con un error de formato no válido

### Requirement: Catálogo global de álbumes

El sistema DEBE almacenar los datos de cada álbum en un catálogo global reutilizable y referenciarlo desde la colección.

#### Scenario: Álbum nuevo en el catálogo

- **WHEN** se guarda un álbum que no existe en el catálogo
- **THEN** el sistema crea el documento del álbum en el catálogo global

#### Scenario: Álbum ya existente en el catálogo

- **WHEN** se guarda un álbum que ya existe en el catálogo
- **THEN** el sistema reutiliza el documento existente sin crear otro

### Requirement: Listado de la colección

El sistema DEBE listar los álbumes guardados del usuario con sus datos de álbum, emociones, actividades y formatos, ordenados del más reciente al más antiguo, sin mostrar las etiquetas personales en las tarjetas, y DEBE informar si la carga falla en lugar de quedarse cargando.

#### Scenario: Colección con álbumes

- **WHEN** el usuario abre su colección y tiene álbumes guardados
- **THEN** el sistema los muestra del más reciente al más antiguo junto con los datos del álbum

#### Scenario: Etiquetas ocultas en las tarjetas

- **WHEN** la persona ve las tarjetas de su colección
- **THEN** las tarjetas no muestran las etiquetas personales de cada álbum

#### Scenario: Colección vacía

- **WHEN** el usuario no tiene álbumes guardados
- **THEN** el sistema muestra el estado vacío y un acceso a la búsqueda

#### Scenario: Error al cargar la colección

- **WHEN** la carga de la colección falla
- **THEN** el sistema muestra un estado de error con la opción de reintentar, y no deja la pantalla cargando indefinidamente

### Requirement: Quitar un álbum de la colección

El sistema DEBE permitir eliminar un álbum de la colección del usuario, y DEBE tratar como inofensivo el intento de quitar un álbum que no está (sin responder con error).

#### Scenario: Eliminación correcta

- **WHEN** la persona elimina un álbum que está en su colección
- **THEN** el sistema elimina la entrada de favoritos y confirma la operación

#### Scenario: Álbum no presente

- **WHEN** se intenta eliminar un álbum que no está en la colección
- **THEN** el sistema responde correctamente indicando que no estaba, y el cliente no lo trata como un fallo

### Requirement: Ordenación de la colección

El sistema DEBE ofrecer siete ordenaciones: más recientes, más antiguos, nombre A-Z, nombre Z-A, artista, año ascendente y año descendente.

#### Scenario: Orden por fecha

- **WHEN** la persona elige "Más recientes" o "Más antiguos"
- **THEN** el sistema ordena por la fecha en que se guardó el álbum

#### Scenario: Orden por nombre o artista

- **WHEN** la persona elige una ordenación por nombre o por artista
- **THEN** el sistema ordena alfabéticamente comparando los textos correspondientes

#### Scenario: Orden por año de lanzamiento

- **WHEN** la persona elige una ordenación por año de lanzamiento
- **THEN** el sistema ordena por el año de lanzamiento en la dirección elegida

### Requirement: Filtrado de la colección

El sistema DEBE permitir filtrar la colección simultáneamente por emociones, géneros, formatos y etiquetas.

#### Scenario: Filtro por emoción

- **WHEN** la persona activa una o más emociones
- **THEN** el sistema muestra solo los álbumes que contienen alguna de esas emociones

#### Scenario: Filtro por género

- **WHEN** la persona activa uno o más géneros
- **THEN** el sistema muestra solo los álbumes cuyo género coincide con alguno de los seleccionados

#### Scenario: Filtro combinado

- **WHEN** la persona combina varios tipos de filtro
- **THEN** el sistema muestra solo los álbumes que cumplen todos los filtros activos

#### Scenario: Limpiar filtros

- **WHEN** la persona pulsa "Limpiar filtros"
- **THEN** el sistema elimina todos los filtros y muestra la colección completa

### Requirement: Agrupación de la colección

El sistema DEBE agrupar visualmente los álbumes según la ordenación activa.

#### Scenario: Agrupación por artista

- **WHEN** la ordenación activa es por artista
- **THEN** el sistema agrupa los álbumes por artista y ordena dentro del grupo por año de lanzamiento descendente

#### Scenario: Agrupación por letra o año

- **WHEN** la ordenación activa es por nombre o por año
- **THEN** el sistema agrupa los álbumes por la letra inicial del nombre o por el año correspondiente

#### Scenario: Sin ordenación

- **WHEN** no hay ordenación seleccionada
- **THEN** el sistema muestra un único grupo sin agrupar

### Requirement: Asistente de guardado en pasos

El sistema DEBE pedir primero si el álbum va a la colección o a pendientes. Si elige la colección, DEBE guiar el guardado en tres pasos —emociones, actividades y formato— y, dentro del paso de formato, DEBE ofrecer «Formato» e «Idioma y género» como dos secciones del mismo paso, con un pie idéntico en ambas. Si elige pendientes, DEBE guardarlo sin recorrer esos pasos.

#### Scenario: Navegación entre pasos

- **WHEN** la persona avanza desde el paso de emociones
- **THEN** el sistema solicita actividades y después el formato de colección

#### Scenario: Formato obligatorio

- **WHEN** la persona intenta guardar sin ningún formato seleccionado
- **THEN** el sistema mantiene deshabilitada la acción de guardar

#### Scenario: Destino pendientes

- **WHEN** la persona elige «Por escuchar» como destino
- **THEN** el sistema guarda el álbum en pendientes sin pedir emociones, actividades, formato ni etiquetas

#### Scenario: Destino colección

- **WHEN** la persona elige «A la colección» como destino
- **THEN** el sistema comienza el asistente por el paso de emociones

#### Scenario: Dos secciones en el paso de formato

- **WHEN** la persona llega al paso de formato
- **THEN** ve un selector con «Formato» e «Idioma y género», la sección de formato activa por defecto y la selección actual resumida en cada opción

#### Scenario: Pie estable entre secciones

- **WHEN** la persona cambia entre «Formato» e «Idioma y género»
- **THEN** el pie sigue mostrando «← Atrás» y «Guardar álbum» sin acciones de navegación intermedias

#### Scenario: Selección conservada al cambiar de sección

- **WHEN** la persona elige idioma y género, vuelve a «Formato» y regresa a «Idioma y género»
- **THEN** la selección se conserva, se refleja en el resumen del selector y se guarda con el álbum

#### Scenario: Formato visible sin desplazamiento

- **WHEN** el paso de formato se abre en una pantalla estrecha (390 × 650 o 320 × 568)
- **THEN** el selector de secciones, el título y los cuatro formatos se ven sin desplazarse

### Requirement: Etiquetas personales

El sistema DEBE permitir añadir etiquetas de categoría y valor al álbum durante el guardado.

#### Scenario: Añadir etiqueta

- **WHEN** la persona introduce una categoría y un valor y confirma
- **THEN** el sistema añade la etiqueta sin duplicados, sin distinguir mayúsculas de minúsculas

### Requirement: Estados de álbum ya guardado y éxito con deshacer

El sistema DEBE mostrar un estado cuando el álbum ya está en la colección y ofrecer deshacer tras guardarlo.

#### Scenario: Álbum ya favorito

- **WHEN** la persona abre un álbum que ya está en su colección
- **THEN** el sistema muestra sus emociones y actividades y ofrece editarlo o eliminarlo

#### Scenario: Deshacer tras guardar

- **WHEN** la persona pulsa "Deshacer" en la confirmación de guardado
- **THEN** el sistema elimina el álbum recién guardado de la colección

### Requirement: Validación de la petición de colección

El sistema DEBE validar toda petición de guardado o borrado antes de tocar los datos: `userId` y el identificador del álbum son obligatorios, y las listas de emociones, actividades y etiquetas DEBEN tratarse como arrays, ignorando los elementos inválidos.

#### Scenario: Petición sin usuario

- **WHEN** llega una petición de colección sin `userId`
- **THEN** el sistema responde con un error de petición inválida y no escribe ni borra nada

#### Scenario: Petición sin álbum

- **WHEN** llega una petición de colección sin un álbum identificable
- **THEN** el sistema responde con un error de petición inválida y no toca los datos

#### Scenario: Listas con elementos inválidos

- **WHEN** la petición incluye emociones o etiquetas con entradas que no son texto válido
- **THEN** el sistema las descarta y guarda solo lo válido, sin fallar la operación

### Requirement: Guardado fiable y reintentable

El sistema DEBE completar el guardado de un álbum y confirmarlo sin depender de servicios externos innecesarios, y ante un fallo transitorio DEBE informar del error y permitir reintentar sin perder los datos del asistente.

#### Scenario: Guardado completado

- **WHEN** la persona completa el asistente y pulsa guardar
- **THEN** el sistema completa el guardado y muestra la confirmación sin quedarse en el paso de formato

#### Scenario: Fallo transitorio

- **WHEN** el guardado falla por un error transitorio
- **THEN** el sistema muestra el error y deja volver a intentarlo desde el mismo paso

#### Scenario: Reintento tras registro parcial

- **WHEN** un intento anterior ya creó el álbum en el catálogo global pero no completó el favorito
- **THEN** un nuevo intento completa el favorito reutilizando el álbum sin duplicarlo

### Requirement: Tarjetas de colección compactas en pantallas estrechas

En pantallas estrechas, el sistema DEBE limitar la información superpuesta a la portada de cada tarjeta de la cuadrícula a una emoción y el contador de emociones restantes, manteniendo la acción de escuchar y la portada reconocible.

#### Scenario: Álbum con varias emociones

- **WHEN** la persona ve en la cuadrícula móvil un álbum con dos o más emociones
- **THEN** la tarjeta muestra una sola emoción y un contador «+N» con las restantes

#### Scenario: Álbum con una emoción

- **WHEN** el álbum tiene exactamente una emoción
- **THEN** la tarjeta muestra esa emoción y ningún contador

#### Scenario: Álbum sin emociones

- **WHEN** el álbum no tiene emociones asociadas
- **THEN** la portada no muestra cápsulas de emoción ni un contador vacío

#### Scenario: Portada reconocible

- **WHEN** la tarjeta muestra contenido superpuesto en una pantalla estrecha
- **THEN** el velo inferior no oculta la portada y la acción de escuchar sigue siendo visible y pulsable

#### Scenario: Emociones completas fuera de la cuadrícula

- **WHEN** la persona abre la ficha del álbum o cambia a la vista de lista
- **THEN** puede consultar todas las emociones del álbum, no solo la mostrada en la tarjeta

#### Scenario: Lectura accesible de la tarjeta

- **WHEN** un lector de pantalla recorre una tarjeta con emociones resumidas
- **THEN** anuncia la emoción visible y cuántas emociones más tiene el álbum

### Requirement: Encabezado y filtros compactos en pantallas estrechas

En pantallas estrechas, el sistema DEBE compactar el encabezado de la colección, el bloque de búsqueda, orden, filtro y vista, y los filtros de emoción, de forma que los primeros discos aparezcan antes en la pantalla.

#### Scenario: Encabezado compacto

- **WHEN** la persona abre la colección en una pantalla estrecha
- **THEN** el título, el subtítulo y las estadísticas ocupan menos altura que en escritorio y siguen siendo legibles

#### Scenario: Filtros de emoción en una fila

- **WHEN** hay más emociones de las que caben en el ancho disponible
- **THEN** los filtros se presentan en una sola fila desplazable horizontalmente en lugar de ocupar varias filas

#### Scenario: Todas las emociones accesibles

- **WHEN** la persona desplaza la fila de filtros de emoción
- **THEN** puede alcanzar todas las emociones y la opción de mostrar todas

#### Scenario: Discos antes en la pantalla

- **WHEN** la colección tiene álbumes y se abre en un móvil de 390 × 844 px
- **THEN** la primera fila de discos aparece dentro de la vista inicial, sin necesidad de desplazarse

#### Scenario: Escritorio intacto

- **WHEN** la colección se abre con 1024 px o más
- **THEN** el encabezado y los filtros conservan su composición actual

### Requirement: Cuadrícula de la colección con tarjetas de tamaño estable

La cuadrícula de la colección DEBE (MUST) mantener un ancho de tarjeta estable de 300–320 px y repartir el número de columnas según el espacio disponible, sin encoger las tarjetas al ensanchar la ventana. En móvil DEBE conservar dos columnas. La vista de lista NO se ve afectada.

#### Scenario: Ventana de escritorio estándar

- **WHEN** la persona abre la colección en una ventana de 1440 px con la barra lateral abierta y varios álbumes
- **THEN** la cuadrícula muestra tres columnas con tarjetas de unos 316 px de ancho

#### Scenario: Ventana ultrawide

- **WHEN** la persona abre la colección en una ventana de 2400 px o más
- **THEN** la cuadrícula añade columnas suficientes para llenar el ancho disponible y las tarjetas conservan entre 300 y 320 px, sin desplazamiento horizontal

#### Scenario: Ventana móvil

- **WHEN** la persona abre la colección en una pantalla de 390 px
- **THEN** la cuadrícula mantiene dos columnas y no aparece desplazamiento horizontal

#### Scenario: Vista de lista

- **WHEN** la persona cambia la colección a la vista de lista
- **THEN** las filas conservan su presentación compacta y el tamaño de tarjeta no interviene

### Requirement: Género derivado del artista

Al abrir el guardado de un álbum, el sistema DEBE (MUST) derivar el género de sus artistas vía Spotify, unirlo, mapearlo a una rama principal y proponerlo como etiqueta de género editable. El idioma NO DEBE (MUST NOT) derivarse de la API: sigue siendo una etiqueta manual. Si Spotify falla, el guardado DEBE (MUST) continuar sin género derivado.

#### Scenario: Relleno previo del género

- **WHEN** la persona abre el guardado de un álbum con artistas
- **THEN** el sistema propone la rama de género derivada, por ejemplo `latin hip hop` o `rap español` como `hip-hop`, y `powermetal` o `metalcore` como `metal`

#### Scenario: Edición del género

- **WHEN** la persona corrige o elimina la etiqueta de género propuesta
- **THEN** el sistema guarda su elección, no la derivada

#### Scenario: Spotify no responde

- **WHEN** la consulta de artistas falla o no devuelve géneros
- **THEN** el guardado continúa sin género derivado y la persona puede añadirlo manualmente

#### Scenario: Idioma manual

- **WHEN** se guarda un álbum
- **THEN** el idioma solo existe si la persona lo añade como etiqueta

### Requirement: Filtrado por rama de género

La colección DEBE (MUST) filtrar por ramas canónicas de género y tratar igual el género derivado y la etiqueta manual.

#### Scenario: Filtro por hip-hop

- **WHEN** la persona filtra por `hip-hop`
- **THEN** aparecen los álbumes cuya rama derivada o etiqueta de género sea `hip-hop`

#### Scenario: Filtro por metal

- **WHEN** la persona filtra por `metal`
- **THEN** aparecen los álbumes mapeados a `metal`, incluidos `powermetal` y `metalcore`

#### Scenario: Filtro combinado

- **WHEN** la persona combina género con emoción, formato u otra etiqueta
- **THEN** se aplican todos los filtros activos
