# Spec Delta

## ADDED Requirements

### Requirement: Nombre y dirección de la colección

La colección de álbumes DEBE (MUST) llamarse «Colección» en toda la interfaz, en español y en inglés, y DEBE vivir en `/collection`. La ruta antigua `/favorites` DEBE redirigir de forma permanente a `/collection` conservando la pestaña solicitada.

#### Scenario: Nombre en la interfaz

- **WHEN** la persona consulta el panel, la cabecera de la página, los estados vacíos o los avisos de guardado
- **THEN** la funcionalidad aparece como «Colección» («Collection» en inglés) y no como «Favoritos»

#### Scenario: Ruta nueva

- **WHEN** la persona abre `/collection`
- **THEN** el sistema muestra su colección con la pestaña solicitada o, por defecto, la pestaña «Colección»

#### Scenario: Ruta antigua

- **WHEN** la persona abre `/favorites` o `/favorites?tab=listen-later`
- **THEN** el sistema la redirige de forma permanente a `/collection` o `/collection?tab=listen-later` respectivamente

### Requirement: Resumen de la colección

El sistema DEBE (MUST) mostrar sobre el listado un resumen de la colección con el número total de álbumes, el número de artistas distintos y el número de emociones presentes, y DEBE ocultarlo cuando la colección está vacía. En la pestaña «Por escuchar» el resumen DEBE mostrar el total de pendientes y sus artistas distintos.

#### Scenario: Resumen con álbumes

- **WHEN** la persona tiene álbumes en su colección
- **THEN** el sistema muestra el total de álbumes, los artistas distintos y las emociones presentes

#### Scenario: Resumen de pendientes

- **WHEN** la persona abre la pestaña «Por escuchar» y tiene pendientes
- **THEN** el sistema muestra el total de pendientes y sus artistas distintos

#### Scenario: Colección vacía

- **WHEN** la persona no tiene álbumes en la colección
- **THEN** el sistema no muestra el resumen y sí el estado vacío con acceso a la búsqueda

### Requirement: Vista de cuadrícula y lista

El sistema DEBE (MUST) ofrecer un conmutador entre vista de cuadrícula y vista de lista en las pestañas «Colección» y «Por escuchar», DEBE recordar la vista elegida mientras la página está abierta y DEBE anunciar la acción disponible mediante una etiqueta accesible.

#### Scenario: Cambio a lista

- **WHEN** la persona pulsa el conmutador estando en cuadrícula
- **THEN** el sistema muestra los álbumes como filas compactas con portada, título y artistas

#### Scenario: Cambio a cuadrícula

- **WHEN** la persona pulsa el conmutador estando en lista
- **THEN** el sistema muestra los álbumes como tarjetas con portada cuadrada

#### Scenario: Vista conservada al cambiar de pestaña

- **WHEN** la persona cambia entre «Colección» y «Por escuchar»
- **THEN** el sistema mantiene la vista de cuadrícula o lista elegida

#### Scenario: Etiqueta accesible

- **WHEN** la persona navega con un lector de pantalla hasta el conmutador
- **THEN** el sistema anuncia si la acción cambia a lista o a cuadrícula

### Requirement: Presentación de los álbumes de la colección

Cada álbum de la colección DEBE (MUST) mostrarse con portada, título, artistas, hasta dos emociones con su emoji, sus formatos y una acción para abrirlo en Spotify. Las etiquetas personales NO DEBEN mostrarse en las tarjetas ni en las filas. En pendientes no se muestran emociones, actividades, formatos ni etiquetas.

#### Scenario: Tarjeta de colección

- **WHEN** la persona ve un álbum en la vista de cuadrícula
- **THEN** la tarjeta muestra portada, título, artista, emociones y formatos, y permite abrirlo en Spotify

#### Scenario: Fila de colección

- **WHEN** la persona ve un álbum en la vista de lista
- **THEN** la fila muestra portada, título, artista, emociones y formatos, y permite abrirlo en Spotify

#### Scenario: Pendiente sin emociones

- **WHEN** la persona ve un álbum en la pestaña «Por escuchar»
- **THEN** el sistema lo muestra sin emociones, actividades, formatos ni etiquetas

#### Scenario: Etiquetas fuera de la tarjeta

- **WHEN** un álbum tiene etiquetas personales guardadas
- **THEN** la tarjeta y la fila no las muestran

### Requirement: Continuidad de la colección tras el renombrado

El sistema DEBE (MUST) conservar los álbumes guardados antes del renombrado: los documentos de `users/{uid}/favorites` DEBEN migrarse a `users/{uid}/collection` sin pérdida ni duplicados, y durante la transición el servidor DEBE seguir leyendo la ruta antigua cuando la nueva esté vacía. Las escrituras DEBEN dirigirse siempre a la ruta nueva.

#### Scenario: Álbum anterior al renombrado

- **WHEN** una persona que ya tenía álbumes guardados abre la colección después del despliegue y antes de ejecutar la migración
- **THEN** el sistema sigue mostrando esos álbumes sin pedir ninguna acción

#### Scenario: Migración idempotente

- **WHEN** el script de migración se ejecuta dos veces
- **THEN** el sistema no duplica documentos ni sobrescribe datos ya migrados, e informa de los conflictos sin borrar nada

#### Scenario: Escritura durante la transición

- **WHEN** la persona guarda o quita un álbum mientras la ruta antigua todavía existe
- **THEN** el sistema escribe en `users/{uid}/collection` y elimina la copia antigua de ese álbum para que no reaparezca

#### Scenario: Fin de la transición

- **WHEN** la migración se verifica con los mismos recuentos en origen y destino
- **THEN** el sistema puede retirar la lectura de la ruta antigua sin afectar a la colección visible

## MODIFIED Requirements

### Requirement: Guardar un álbum en la colección

El sistema DEBE (MUST) guardar un álbum para el usuario con sus emociones, actividades, formatos y etiquetas asociados.

#### Scenario: Guardado correcto

- **WHEN** la persona completa el asistente y pulsa "Guardar álbum"
- **THEN** el sistema registra el álbum en `users/{uid}/collection` con emociones, actividades, formatos y etiquetas, y confirma el guardado

#### Scenario: Álbum ya guardado

- **WHEN** la persona guarda un álbum que ya estaba en su colección
- **THEN** el sistema actualiza los datos existentes en lugar de crear un duplicado

### Requirement: Listado de la colección

El sistema DEBE (MUST) listar los álbumes guardados del usuario con sus datos de álbum, emociones, actividades y formatos, ordenados del más reciente al más antiguo, sin mostrar las etiquetas personales en las tarjetas, y DEBE informar si la carga falla en lugar de quedarse cargando.

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

El sistema DEBE (MUST) permitir eliminar un álbum de la colección del usuario, y DEBE tratar como inofensivo el intento de quitar un álbum que no está (sin responder con error).

#### Scenario: Eliminación correcta

- **WHEN** la persona elimina un álbum que está en su colección
- **THEN** el sistema elimina la entrada de la colección y confirma la operación

#### Scenario: Álbum no presente

- **WHEN** se intenta eliminar un álbum que no está en la colección
- **THEN** el sistema responde correctamente indicando que no estaba, y el cliente no lo trata como un fallo

### Requirement: Agrupación de la colección

El sistema DEBE (MUST) agrupar visualmente los álbumes: por fecha de guardado cuando no hay ordenación o la ordenación es por fecha, y según la ordenación activa cuando se ordena por artista, nombre o año.

#### Scenario: Sin ordenación

- **WHEN** no hay ordenación seleccionada
- **THEN** el sistema agrupa los álbumes por fecha de guardado, del grupo más reciente al más antiguo, con su recuento

#### Scenario: Ordenación por fecha

- **WHEN** la ordenación activa es "Más recientes" o "Más antiguos"
- **THEN** el sistema agrupa los álbumes por fecha de guardado en la dirección elegida y ordena dentro de cada grupo en esa misma dirección

#### Scenario: Agrupación por artista

- **WHEN** la ordenación activa es por artista
- **THEN** el sistema agrupa los álbumes por artista y ordena dentro del grupo por año de lanzamiento descendente

#### Scenario: Agrupación por letra o año

- **WHEN** la ordenación activa es por nombre o por año
- **THEN** el sistema agrupa los álbumes por la letra inicial del nombre o por el año correspondiente

#### Scenario: Grupo único en pendientes

- **WHEN** la persona abre «Por escuchar»
- **THEN** el sistema agrupa los pendientes por fecha de incorporación, del más reciente al más antiguo

### Requirement: Estados de álbum ya guardado y éxito con deshacer

El sistema DEBE (MUST) mostrar un estado cuando el álbum ya está en la colección y ofrecer deshacer tras guardarlo.

#### Scenario: Álbum ya favorito

- **WHEN** la persona abre un álbum que ya forma parte de su colección
- **THEN** el sistema muestra sus emociones y actividades y ofrece editarlo o eliminarlo

#### Scenario: Deshacer tras guardar

- **WHEN** la persona pulsa "Deshacer" en la confirmación de guardado
- **THEN** el sistema elimina el álbum recién guardado de la colección

### Requirement: Guardado fiable y reintentable

El sistema DEBE (MUST) completar el guardado de un álbum y confirmarlo sin depender de servicios externos innecesarios, y ante un fallo transitorio DEBE informar del error y permitir reintentar sin perder los datos del asistente.

#### Scenario: Guardado completado

- **WHEN** la persona completa el asistente y pulsa guardar
- **THEN** el sistema completa el guardado y muestra la confirmación sin quedarse en el paso de formato

#### Scenario: Fallo transitorio

- **WHEN** el guardado falla por un error transitorio
- **THEN** el sistema muestra el error y deja volver a intentarlo desde el mismo paso

#### Scenario: Reintento tras registro parcial

- **WHEN** un intento anterior ya creó el álbum en el catálogo global pero no completó la entrada de la colección
- **THEN** un nuevo intento completa la entrada reutilizando el álbum sin duplicarlo
