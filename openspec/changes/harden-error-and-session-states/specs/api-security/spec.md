# Spec Delta

## ADDED Requirements

### Requirement: Clasificación de los fallos de verificación de identidad

La API DEBE (MUST) responder `401` cuando falte el token o sea inválido o esté caducado, y `503` cuando no pueda verificar la identidad por un fallo del verificador, de red o de configuración. En ambos casos el cuerpo DEBE (MUST) llevar un mensaje genérico, sin detalles internos ni el token.

#### Scenario: Token ausente o inválido

- **WHEN** una ruta protegida recibe una petición sin token, con un token mal formado o con uno caducado
- **THEN** responde `401` con un mensaje genérico de sesión no válida

#### Scenario: Verificador no disponible

- **WHEN** la verificación falla porque no se pueden obtener los certificados del proveedor o porque la red no responde
- **THEN** responde `503` con un mensaje genérico que invita a reintentar, sin tratarlo como un token inválido

#### Scenario: Configuración del verificador incompleta

- **WHEN** el servidor no tiene configurada la verificación de identidad
- **THEN** responde `503` con un mensaje genérico de servicio no disponible

#### Scenario: Sin detalles internos en la respuesta

- **WHEN** se produce cualquiera de los fallos anteriores
- **THEN** el cuerpo de la respuesta no incluye trazas, nombres de proyecto, códigos internos ni el token recibido

### Requirement: Registro seguro de fallos de verificación

El servidor DEBE (MUST) registrar el código y el contexto del fallo de verificación para diagnóstico, sin incluir el token ni credenciales. El registro NO DEBE (MUST NOT) alterar la respuesta que recibe el cliente.

#### Scenario: Fallo de red durante la verificación

- **WHEN** la verificación falla por un error de red o de obtención de certificados
- **THEN** el servidor registra el código del error y la ruta afectada para poder diagnosticarlo

#### Scenario: El token no se registra

- **WHEN** se registra un fallo de verificación
- **THEN** el registro no contiene el token, la cabecera `Authorization` ni credenciales

#### Scenario: La respuesta no cambia por el registro

- **WHEN** el fallo se registra correctamente
- **THEN** el cliente recibe exactamente la misma respuesta `401` o `503` que sin el registro
