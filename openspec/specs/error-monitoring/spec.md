# error-monitoring Specification

## Purpose

Permite enterarse de los errores no controlados de la interfaz, del servidor y de las rutas de API mediante un servicio externo opcional, sin filtrar credenciales y sin afectar al funcionamiento normal cuando no está configurado.

## Requirements

### Requirement: Captura de errores no controlados

El sistema DEBE reportar a un servicio de monitorización los errores no controlados de la interfaz, del servidor y de las rutas de API, con contexto suficiente para localizarlos, sin bloquear ni alterar la ejecución normal.

#### Scenario: Error al renderizar una pantalla

- **WHEN** una pantalla lanza una excepción no controlada
- **THEN** el sistema la reporta con su traza y muestra una pantalla de error recuperable

#### Scenario: Error en una ruta de API

- **WHEN** una ruta de API lanza una excepción
- **THEN** el sistema la reporta y la ruta sigue devolviendo su respuesta de error habitual

### Requirement: Activación por configuración

La monitorización DEBE activarse únicamente cuando existe una configuración válida (un DSN). Sin ella, el sistema NO DEBE enviar ningún dato ni impedir el arranque o el uso normal de la aplicación.

#### Scenario: Sin configuración

- **WHEN** no hay DSN configurado
- **THEN** la aplicación funciona con normalidad y no se envía ningún error a ningún servicio

#### Scenario: Con configuración

- **WHEN** se configura un DSN
- **THEN** los errores no controlados se envían a ese servicio

### Requirement: Sin datos sensibles

El sistema NO DEBE enviar credenciales, tokens ni secretos al servicio de monitorización.

#### Scenario: Error en una petición autenticada

- **WHEN** se reporta un error ocurrido en una petición que llevaba un token de autenticación
- **THEN** el reporte no incluye ese token ni ninguna credencial

### Requirement: Reporte de fallos manejados en las rutas de API

El sistema DEBE reportar a la monitorización los fallos que las rutas de API manejan para responder, con la ruta como contexto, sin cambiar la respuesta que devuelve la ruta ni bloquear la petición.

#### Scenario: Fallo que responde con su error habitual

- **WHEN** una ruta de API falla y responde con su error habitual
- **THEN** el sistema reporta el fallo con la ruta como contexto y devuelve exactamente la misma respuesta que antes

#### Scenario: Fallo que degrada la respuesta

- **WHEN** una ruta de API falla y responde con una versión degradada (por ejemplo, una lista vacía)
- **THEN** el sistema reporta el fallo y mantiene la respuesta degradada

#### Scenario: Fallo parcial tolerado

- **WHEN** una parte de la operación falla pero el resultado principal se completa
- **THEN** el sistema reporta la parte fallida y la operación principal sigue devolviendo su éxito habitual

#### Scenario: Los detalles internos no salen al cliente

- **WHEN** una ruta de API falla
- **THEN** el mensaje interno del error queda en la monitorización y la respuesta al cliente lleva un mensaje genérico, sin credenciales ni datos personales
