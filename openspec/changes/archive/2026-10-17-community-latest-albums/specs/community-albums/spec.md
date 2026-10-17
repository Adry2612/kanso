# Spec Delta

## Purpose

Ofrece un feed global y anónimo de los últimos álbumes añadidos por la comunidad y lo presenta en el inicio de la búsqueda para inspirar nuevas escuchas.

## ADDED Requirements

### Requirement: Registro anónimo de álbumes añadidos

El sistema DEBE registrar de forma anónima y global cada álbum que se añade a una colección, guardando un documento por álbum con su fecha, sin almacenar ningún identificador de usuario.

#### Scenario: Álbum añadido

- **WHEN** un álbum se guarda por primera vez en la colección de cualquier usuario
- **THEN** el sistema lo registra en el feed global con la fecha actual

#### Scenario: Álbum repetido

- **WHEN** el mismo álbum se vuelve a añadir (por el mismo u otro usuario)
- **THEN** el sistema actualiza su fecha sin crear un documento duplicado

#### Scenario: El registro no bloquea el guardado

- **WHEN** el registro en el feed falla
- **THEN** el guardado del álbum en la colección del usuario se completa igualmente

### Requirement: Últimos álbumes de la comunidad en la búsqueda

El sistema DEBE mostrar en el estado inicial de la búsqueda una sección con los últimos álbumes añadidos por la comunidad.

#### Scenario: Feed con álbumes

- **WHEN** no hay consulta activa y el feed tiene álbumes
- **THEN** el sistema muestra una sección con los últimos álbumes añadidos por la comunidad

#### Scenario: Abrir un álbum del feed

- **WHEN** la persona pulsa uno de los álbumes del feed
- **THEN** el sistema abre la ficha de ese álbum

#### Scenario: Feed vacío

- **WHEN** no hay consulta activa y el feed no tiene álbumes
- **THEN** el sistema muestra la sección con un estado vacío que invita a añadir el primer disco

#### Scenario: Fallo al cargar el feed

- **WHEN** la carga del feed falla
- **THEN** el sistema muestra la sección en su estado vacío sin bloquear el resto del estado inicial
