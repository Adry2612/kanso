# Spec Delta

## ADDED Requirements

### Requirement: Guardado fiable y reintentable

El sistema DEBE completar el guardado de un álbum y confirmarlo sin depender de servicios externos innecesarios, y ante un fallo transitorio DEBE informar del error y permitir reintentar sin perder los datos del asistente.

#### Scenario: Guardado completado

- **WHEN** la persona completa el asistente y pulsa guardar
- **THEN** el sistema completa el guardado y muestra la confirmación sin quedarse en el paso de formato

#### Scenario: Fallo transitorio

- **WHEN** el guardado falla por un error transitorio
- **THEN** el sistema muestra el error y deja volver a intentarlo desde el mismo paso

#### Scenario: Reintento tras registro parcial

- **WHEN** un intento anterior ya creó el álbum en el catálogo global pero no completó el favorito
- **THEN** un nuevo intento completa el favorito reutilizando el álbum sin duplicarlo
