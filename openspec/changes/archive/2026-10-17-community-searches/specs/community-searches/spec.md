# Spec Delta

## Purpose

Recoge de forma anónima los términos que busca la comunidad y los ofrece en el estado inicial de la búsqueda para inspirar nuevas consultas, sin almacenar ninguna identidad de usuario.

## ADDED Requirements

### Requirement: Registro anónimo de búsquedas

El sistema DEBE registrar cada término buscado de forma anónima, agrupándolo por término normalizado con un contador y la fecha del último uso, sin almacenar ningún identificador de usuario.

#### Scenario: Búsqueda registrada

- **WHEN** la persona ejecuta una búsqueda con una consulta no vacía
- **THEN** el sistema incrementa el contador del término normalizado y actualiza su fecha de último uso

#### Scenario: Término inválido

- **WHEN** la consulta está vacía o solo contiene espacios
- **THEN** el sistema no registra nada

#### Scenario: Sin identidad

- **WHEN** se registra un término
- **THEN** el documento almacenado no contiene ningún identificador de usuario

### Requirement: Búsquedas de la comunidad en el inicio

El sistema DEBE mostrar en el estado inicial de la búsqueda (sin consulta activa) una sección con las últimas búsquedas de la comunidad.

#### Scenario: Últimas búsquedas disponibles

- **WHEN** no hay consulta activa y existen búsquedas registradas
- **THEN** el sistema muestra una sección con las últimas búsquedas de la comunidad

#### Scenario: Pulsar una búsqueda de la comunidad

- **WHEN** la persona pulsa una de las búsquedas mostradas
- **THEN** el sistema establece esa búsqueda como consulta activa

#### Scenario: Sin búsquedas registradas

- **WHEN** no hay consulta activa y no existe ninguna búsqueda registrada
- **THEN** el sistema no muestra la sección de la comunidad y mantiene las sugerencias de la colección

#### Scenario: Fallo al cargar la comunidad

- **WHEN** la carga de las búsquedas de la comunidad falla
- **THEN** el sistema no bloquea la pantalla ni muestra un error invasivo, y mantiene el resto del estado inicial
