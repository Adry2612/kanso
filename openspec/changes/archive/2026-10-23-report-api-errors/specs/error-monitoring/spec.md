# Spec Delta

## ADDED Requirements

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
