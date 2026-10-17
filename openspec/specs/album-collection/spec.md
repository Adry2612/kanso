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

El sistema DEBE guiar el guardado en tres pasos: emociones, actividades y formato.

#### Scenario: Navegación entre pasos

- **WHEN** la persona avanza desde el paso de emociones
- **THEN** el sistema solicita actividades y después el formato de colección

#### Scenario: Formato obligatorio

- **WHEN** la persona intenta guardar sin ningún formato seleccionado
- **THEN** el sistema mantiene deshabilitada la acción de guardar

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
