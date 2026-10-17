# Spec Delta

## MODIFIED Requirements

### Requirement: Registro anónimo de búsquedas

El sistema DEBE registrar cada término buscado de forma anónima, agrupándolo por término normalizado con un contador y la fecha del último uso, sin almacenar ningún identificador de usuario. El registro DEBE esperar a que la consulta se asiente (una pausa mayor que el retardo de búsqueda), ignorar términos de menos de 3 caracteres y no registrar dos veces seguidas el mismo término en una misma sesión. Si el término extiende a otro registrado previamente en la misma sesión (por ejemplo "extre" → "extremoduro"), el sistema DEBE sustituir el parcial por el término definitivo en lugar de conservar ambos.

#### Scenario: Búsqueda registrada

- **WHEN** la persona escribe una consulta de 3 o más caracteres y deja de escribir durante una pausa mayor que el retardo de búsqueda
- **THEN** el sistema incrementa el contador del término normalizado y actualiza su fecha de último uso

#### Scenario: Término demasiado corto

- **WHEN** la consulta tiene menos de 3 caracteres
- **THEN** el sistema no registra nada

#### Scenario: Misma búsqueda repetida seguida

- **WHEN** el término que se va a registrar es el mismo que el último registrado en la sesión
- **THEN** el sistema no vuelve a registrarlo

#### Scenario: Prefijo en curso

- **WHEN** el término que se va a registrar extiende al último registrado en la misma sesión (por ejemplo "extre" → "extremoduro")
- **THEN** el sistema registra el término definitivo y elimina el parcial

#### Scenario: Término inválido

- **WHEN** la consulta está vacía o solo contiene espacios
- **THEN** el sistema no registra nada

#### Scenario: Sin identidad

- **WHEN** se registra un término
- **THEN** el documento almacenado no contiene ningún identificador de usuario

### Requirement: Búsquedas de la comunidad en el inicio

El sistema DEBE mostrar en el estado inicial de la búsqueda (sin consulta activa) una sección con las últimas búsquedas de la comunidad, con los términos normalizados (sin diferencias de mayúsculas ni espacios sobrantes) para que una misma búsqueda aparezca siempre igual.

#### Scenario: Últimas búsquedas disponibles

- **WHEN** no hay consulta activa y existen búsquedas registradas
- **THEN** el sistema muestra una sección con las últimas búsquedas de la comunidad

#### Scenario: Términos normalizados

- **WHEN** una búsqueda se registró antes de normalizar (por ejemplo "NACH")
- **THEN** el sistema la muestra normalizada (por ejemplo "nach")

#### Scenario: Pulsar una búsqueda de la comunidad

- **WHEN** la persona pulsa una de las búsquedas mostradas
- **THEN** el sistema establece esa búsqueda como consulta activa

#### Scenario: Sin búsquedas registradas

- **WHEN** no hay consulta activa y no existe ninguna búsqueda registrada
- **THEN** el sistema no muestra la sección de la comunidad y mantiene las sugerencias de la colección

#### Scenario: Fallo al cargar la comunidad

- **WHEN** la carga de las búsquedas de la comunidad falla
- **THEN** el sistema no bloquea la pantalla ni muestra un error invasivo, y mantiene el resto del estado inicial
