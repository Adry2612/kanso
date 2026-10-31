# Spec Delta

## ADDED Requirements

### Requirement: Aviso de álbumes incompletos

El sistema DEBE (MUST) mostrar sobre el listado de la colección un aviso discreto con el número de álbumes a los que les falta al menos una emoción o al menos una actividad, desglosando ambos casos cuando existan. El aviso DEBE incluir una acción «Revisar» que active el filtro de incompletos, DEBE poder ocultarse hasta que se recargue la página y NO DEBE mostrarse si no hay álbumes incompletos, si ese filtro ya está activo o en la pestaña «Por escuchar».

#### Scenario: Álbumes sin emociones y sin actividades

- **WHEN** la persona tiene álbumes a los que les faltan emociones y álbumes a los que les faltan actividades
- **THEN** el aviso indica cuántos álbumes incompletos hay y desglosa cuántos carecen de emociones y cuántos de actividades

#### Scenario: Solo faltan emociones

- **WHEN** todos los álbumes incompletos solo carecen de emociones
- **THEN** el aviso indica cuántos álbumes no tienen emociones asignadas

#### Scenario: Solo faltan actividades

- **WHEN** todos los álbumes incompletos solo carecen de actividades
- **THEN** el aviso indica cuántos álbumes no tienen actividades asignadas

#### Scenario: Sin álbumes incompletos

- **WHEN** todos los álbumes de la colección tienen al menos una emoción y una actividad
- **THEN** el sistema no muestra el aviso

#### Scenario: Acción Revisar

- **WHEN** la persona pulsa «Revisar» en el aviso
- **THEN** el sistema activa el filtro de incompletos, muestra solo esos álbumes y el aviso deja de mostrarse

#### Scenario: Filtro ya activo

- **WHEN** el filtro de incompletos está activo
- **THEN** el sistema no repite el aviso y mantiene visible el chip del filtro para poder quitarlo

#### Scenario: Ocultar el aviso

- **WHEN** la persona oculta el aviso con su acción de cierre
- **THEN** el aviso deja de mostrarse hasta que recargue la página, sin desactivar el filtro de incompletos

#### Scenario: Pendientes sin aviso

- **WHEN** la persona abre la pestaña «Por escuchar»
- **THEN** el sistema no muestra el aviso de incompletos, porque los pendientes no tienen emociones ni actividades

### Requirement: Separación de las herramientas de la colección

El sistema DEBE (MUST) separar visualmente los bloques de la colección: la cabecera y su resumen respecto a las pestañas, y el buscador respecto al selector rápido de emociones. La separación DEBE mantenerse en escritorio y en pantallas estrechas sin aumentar el desplazamiento horizontal.

#### Scenario: Cabecera y pestañas

- **WHEN** la persona abre la colección con álbumes
- **THEN** existe un espacio visible entre el resumen de álbumes, artistas y emociones y la fila de pestañas

#### Scenario: Buscador y emociones

- **WHEN** la persona ve el buscador y los chips de emoción en la pestaña «Colección»
- **THEN** existe un espacio visible entre ambos bloques y los chips no quedan pegados al borde inferior del buscador

#### Scenario: Pantalla estrecha

- **WHEN** la persona abre la colección a 320 px de ancho
- **THEN** la separación se mantiene, los bloques se apilan sin solaparse y no aparece desplazamiento horizontal

## MODIFIED Requirements

### Requirement: Listado de la colección

El sistema DEBE (MUST) listar los álbumes guardados con sus datos de álbum, emociones, actividades y formatos, sin mostrar las etiquetas personales en las tarjetas ni marcas de fecha u hora de guardado, y DEBE informar si la carga falla en lugar de quedarse cargando.

#### Scenario: Colección con álbumes

- **WHEN** el usuario abre su colección y tiene álbumes guardados
- **THEN** el sistema los muestra con los datos del álbum, sus emociones y sus formatos, sin cabeceras de fecha ni horas

#### Scenario: Sin marcas de tiempo

- **WHEN** la persona ve una tarjeta o una fila de su colección
- **THEN** no aparece la fecha ni la hora en que guardó el álbum

#### Scenario: Etiquetas ocultas en las tarjetas

- **WHEN** la persona ve las tarjetas de su colección
- **THEN** las tarjetas no muestran las etiquetas personales de cada álbum

#### Scenario: Colección vacía

- **WHEN** el usuario no tiene álbumes guardados
- **THEN** el sistema muestra el estado vacío y un acceso a la búsqueda

#### Scenario: Error al cargar la colección

- **WHEN** la carga de la colección falla
- **THEN** el sistema muestra un estado de error con la opción de reintentar, y no deja la pantalla cargando indefinidamente

### Requirement: Filtrado de la colección

El sistema DEBE (MUST) permitir filtrar la colección simultáneamente por emociones, géneros, formatos y etiquetas, y DEBE ofrecer un filtro de álbumes incompletos que muestre solo los que carecen de emociones o de actividades.

#### Scenario: Filtro por emoción

- **WHEN** la persona activa una o más emociones
- **THEN** el sistema muestra solo los álbumes que contienen alguna de esas emociones

#### Scenario: Filtro por género

- **WHEN** la persona activa uno o más géneros
- **THEN** el sistema muestra solo los álbumes cuyo género coincide con alguno de los seleccionados

#### Scenario: Filtro combinado

- **WHEN** la persona combina varios tipos de filtro
- **THEN** el sistema muestra solo los álbumes que cumplen todos los filtros activos

#### Scenario: Filtro de incompletos

- **WHEN** la persona activa el filtro de incompletos
- **THEN** el sistema muestra solo los álbumes a los que les falta al menos una emoción o al menos una actividad

#### Scenario: Limpiar filtros

- **WHEN** la persona pulsa "Limpiar filtros"
- **THEN** el sistema elimina todos los filtros, incluido el de incompletos, y muestra la colección completa

### Requirement: Agrupación de la colección

El sistema DEBE (MUST) agrupar visualmente los álbumes solo cuando la persona elige una agrupación en los filtros. La agrupación DEBE ser independiente de la ordenación, DEBE incluir las opciones Sin agrupar, Fecha de guardado, Artista, Letra del título y Año de lanzamiento, y DEBE aplicar la ordenación dentro de cada grupo.

#### Scenario: Agrupación por artista

- **WHEN** la persona elige la agrupación por artista
- **THEN** el sistema agrupa los álbumes por artista y los ordena dentro del grupo según la ordenación activa

#### Scenario: Agrupación por letra o año

- **WHEN** la persona elige la agrupación por letra del título o por año de lanzamiento
- **THEN** el sistema agrupa los álbumes por la letra inicial del nombre o por el año de lanzamiento, respectivamente

#### Scenario: Sin ordenación

- **WHEN** no hay ninguna agrupación seleccionada
- **THEN** el sistema muestra un único listado plano, sin cabeceras de grupo, con la ordenación activa

#### Scenario: Ordenación por fecha

- **WHEN** la persona ordena por fecha sin haber elegido una agrupación
- **THEN** el sistema reordena la lista plana por fecha, sin crear cabeceras de grupo

#### Scenario: Agrupación por fecha

- **WHEN** la persona elige la agrupación por fecha de guardado
- **THEN** el sistema agrupa los álbumes por la fecha en que se guardaron, sin mostrar la hora

#### Scenario: Agrupación independiente de la ordenación

- **WHEN** la persona cambia la ordenación sin cambiar la agrupación
- **THEN** el sistema mantiene los mismos grupos y solo reordena los álbumes dentro de cada uno

#### Scenario: Grupo único en pendientes

- **WHEN** la persona abre la pestaña «Por escuchar»
- **THEN** el sistema no muestra cabeceras de grupo, aunque la colección tuviera una agrupación activa

#### Scenario: Agrupación recordada mientras la página está abierta

- **WHEN** la persona cambia de pestaña y vuelve a «Colección»
- **THEN** el sistema conserva la agrupación elegida
