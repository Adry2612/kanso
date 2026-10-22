# listen-later Specification

## Purpose

Permite guardar y gestionar una lista privada de álbumes que la persona quiere escuchar más adelante, separada de la colección y sin emociones, actividades, formato ni etiquetas.

## Requirements

### Requirement: Pestaña Por escuchar en la colección

La página de colección DEBE ofrecer dos pestañas, «Colección» y «Por escuchar», y DEBE permitir cambiar entre ellas sin recargar la página. La pestaña activa DEBE quedar visualmente identificada.

#### Scenario: Cambio a pendientes

- **WHEN** la persona selecciona la pestaña «Por escuchar»
- **THEN** el sistema muestra la lista de álbumes pendientes y marca esa pestaña como activa

#### Scenario: Vuelta a la colección

- **WHEN** la persona selecciona la pestaña «Colección»
- **THEN** el sistema vuelve a mostrar la colección con sus ordenaciones y filtros habituales

### Requirement: Listado de álbumes pendientes

El sistema DEBE listar los álbumes pendientes del usuario del más reciente al más antiguo, con portada, título y artistas, y DEBE mostrar estados de carga, lista vacía y error con reintento en lugar de quedarse cargando indefinidamente.

#### Scenario: Lista con álbumes pendientes

- **WHEN** la persona abre la pestaña «Por escuchar» y tiene álbumes pendientes
- **THEN** el sistema los muestra del más reciente al más antiguo con su portada, título y artistas

#### Scenario: Lista vacía

- **WHEN** la persona abre la pestaña «Por escuchar» y no tiene álbumes pendientes
- **THEN** el sistema muestra un estado vacío con un acceso a la búsqueda

#### Scenario: Error al cargar pendientes

- **WHEN** la carga de la lista de pendientes falla
- **THEN** el sistema muestra un estado de error con la opción de reintentar

### Requirement: Guardar un álbum en pendientes

El sistema DEBE guardar un álbum en la lista privada de pendientes del usuario con la referencia al álbum y la fecha de incorporación, sin emociones, actividades, formato ni etiquetas. La operación DEBE ser idempotente: guardar dos veces el mismo álbum NO DEBE crear duplicados.

#### Scenario: Guardado correcto

- **WHEN** la persona elige «Por escuchar» para un álbum y confirma
- **THEN** el sistema registra el álbum en pendientes y confirma la incorporación

#### Scenario: Guardado repetido

- **WHEN** la persona guarda en pendientes un álbum que ya estaba pendiente
- **THEN** el sistema mantiene una sola entrada para ese álbum sin duplicarlo

#### Scenario: Álbum no identificable

- **WHEN** la petición de guardado no incluye un álbum con identificador válido
- **THEN** el sistema responde con un error de petición inválida y no escribe nada

### Requirement: Quitar un álbum de pendientes

El sistema DEBE permitir eliminar un álbum de la lista de pendientes y DEBE tratar como inofensivo el intento de quitar un álbum que no está.

#### Scenario: Eliminación correcta

- **WHEN** la persona quita un álbum que está en pendientes
- **THEN** el sistema elimina la entrada y confirma la operación

#### Scenario: Álbum no presente

- **WHEN** se intenta quitar un álbum que no está en pendientes
- **THEN** el sistema responde correctamente indicando que no estaba, sin tratarlo como un fallo

### Requirement: Exclusividad entre pendientes y colección

Un álbum pendiente NO DEBE considerarse parte de la colección. El sistema NO DEBE ofrecer guardarlo en pendientes si ya está en la colección, y DEBE retirarlo de pendientes cuando se guarde en la colección.

#### Scenario: Álbum ya en la colección

- **WHEN** la persona abre un álbum que ya forma parte de su colección
- **THEN** el sistema no ofrece añadirlo a pendientes

#### Scenario: Pendiente que pasa a la colección

- **WHEN** se completa el guardado en la colección de un álbum que estaba pendiente
- **THEN** el sistema lo incorpora a la colección y lo retira de pendientes

#### Scenario: Álbum pendiente fuera de la colección

- **WHEN** la persona consulta un álbum que está en pendientes
- **THEN** el sistema lo presenta como pendiente y no como parte de la colección

### Requirement: Pasar un pendiente a la colección

El sistema DEBE permitir iniciar el asistente de guardado en la colección desde un álbum pendiente. Si la persona cancela, el álbum DEBE seguir en pendientes; si completa el guardado, DEBE dejar de estar pendiente.

#### Scenario: Inicio del guardado

- **WHEN** la persona elige pasar un álbum pendiente a la colección
- **THEN** el sistema abre el asistente de guardado con el destino colección seleccionado

#### Scenario: Cancelación

- **WHEN** la persona cierra el asistente sin guardar
- **THEN** el álbum permanece en la lista de pendientes

#### Scenario: Guardado completado

- **WHEN** la persona completa el asistente para un álbum pendiente
- **THEN** el sistema lo guarda en la colección y lo elimina de pendientes

### Requirement: Privacidad de la lista de pendientes

La lista de pendientes DEBE ser privada: solo su propietario puede consultarla o modificarla mediante la API autenticada, y NO DEBE aparecer en el feed de comunidad ni en la biblioteca compartida con amistades.

#### Scenario: Acceso sin autorización

- **WHEN** una petición a la API de pendientes no incluye un token válido o intenta acceder a datos de otra persona
- **THEN** el sistema rechaza la petición sin devolver ni modificar pendientes

#### Scenario: Biblioteca compartida

- **WHEN** una amistad consulta la biblioteca compartida de la persona
- **THEN** el sistema no incluye sus álbumes pendientes

#### Scenario: Feed de comunidad

- **WHEN** se guarda un álbum en pendientes
- **THEN** el sistema no lo publica en el feed de comunidad
