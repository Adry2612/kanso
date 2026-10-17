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
