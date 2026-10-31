# Spec Delta

## ADDED Requirements

### Requirement: Reporte de fallos de verificación de identidad

El sistema DEBE (MUST) reportar a la monitorización los fallos de verificación de identidad que afecten a una petición, con la ruta y el código del error, sin tokens ni credenciales. Si la monitorización no está configurada, la respuesta de la API NO DEBE (MUST NOT) cambiar.

#### Scenario: Fallo de infraestructura al verificar

- **WHEN** la verificación de identidad falla por red, certificados o configuración
- **THEN** el fallo se reporta con la ruta y su código de error para poder diagnosticarlo

#### Scenario: Sin datos sensibles

- **WHEN** se reporta un fallo de verificación
- **THEN** el reporte no incluye el token, la cabecera `Authorization` ni credenciales

#### Scenario: Monitorización desactivada

- **WHEN** no hay un servicio de monitorización configurado
- **THEN** la API sigue respondiendo `401` o `503` con normalidad y no se envía ningún dato
