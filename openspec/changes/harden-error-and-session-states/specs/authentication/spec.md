# Spec Delta

## ADDED Requirements

### Requirement: Recuperación ante un token rechazado

Ante un `401`, el cliente DEBE (MUST) refrescar el token una vez y repetir la petición. Si el segundo intento vuelve a recibir `401`, DEBE (MUST) mostrar el estado de sesión no validada sin cerrar la sesión automáticamente. Un `503` NO DEBE (MUST NOT) interpretarse como una sesión inválida.

#### Scenario: Token caducado que se puede refrescar

- **WHEN** una petición recibe `401` porque el token ha caducado y el refresco obtiene uno nuevo
- **THEN** la petición se repite una vez y la pantalla carga sus datos sin mostrar error

#### Scenario: Token rechazado después del refresco

- **WHEN** la petición repetida con el token refrescado vuelve a recibir `401`
- **THEN** la app muestra el estado de sesión no validada con la acción de iniciar sesión de nuevo y no cierra la sesión por su cuenta

#### Scenario: Verificador no disponible

- **WHEN** la API responde `503` porque no pudo verificar la identidad
- **THEN** la app conserva la sesión, no refresca el token en bucle y ofrece reintentar

#### Scenario: Reautenticación manual

- **WHEN** la persona elige iniciar sesión de nuevo desde el estado de sesión
- **THEN** puede autenticarse y volver a la pantalla donde estaba sin perder el resto del estado de la aplicación

#### Scenario: Un solo refresco por petición

- **WHEN** una petición falla con `401`
- **THEN** el cliente intenta refrescar el token una sola vez y repite la petición como máximo una vez
