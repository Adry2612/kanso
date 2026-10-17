# Spec Delta

## MODIFIED Requirements

### Requirement: Búsqueda con retardo (debounce)

El sistema DEBE buscar en Spotify tras un retardo de 500 ms desde la última pulsación, sin realizar búsquedas mientras la consulta está vacía. Al iniciar una búsqueda nueva, el sistema DEBE cancelar la petición anterior que siga en curso para no mostrar resultados obsoletos.

#### Scenario: Consulta efectiva

- **WHEN** la persona escribe una consulta y deja de escribir 500 ms
- **THEN** el sistema solicita resultados de álbumes y artistas a Spotify

#### Scenario: Consulta vacía

- **WHEN** la consulta está vacía o solo contiene espacios
- **THEN** el sistema no realiza ninguna búsqueda y limpia los resultados y errores

#### Scenario: Escritura rápida sin resultados obsoletos

- **WHEN** la consulta cambia antes de que llegue la respuesta de la búsqueda anterior
- **THEN** el sistema descarta la respuesta anterior y muestra solo los resultados de la consulta más reciente
