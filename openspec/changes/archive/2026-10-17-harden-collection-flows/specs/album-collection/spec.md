# Spec Delta

## ADDED Requirements

### Requirement: Validación de la petición de colección

El sistema DEBE validar toda petición de guardado o borrado antes de tocar los datos: `userId` y el identificador del álbum son obligatorios, y las listas de emociones, actividades y etiquetas DEBEN tratarse como arrays, ignorando los elementos inválidos.

#### Scenario: Petición sin usuario

- **WHEN** llega una petición de colección sin `userId`
- **THEN** el sistema responde con un error de petición inválida y no escribe ni borra nada

#### Scenario: Petición sin álbum

- **WHEN** llega una petición de colección sin un álbum identificable
- **THEN** el sistema responde con un error de petición inválida y no toca los datos

#### Scenario: Listas con elementos inválidos

- **WHEN** la petición incluye emociones o etiquetas con entradas que no son texto válido
- **THEN** el sistema las descarta y guarda solo lo válido, sin fallar la operación

## MODIFIED Requirements

### Requirement: Quitar un álbum de la colección

El sistema DEBE permitir eliminar un álbum de la colección del usuario, y DEBE tratar como inofensivo el intento de quitar un álbum que no está (sin responder con error).

#### Scenario: Eliminación correcta

- **WHEN** la persona elimina un álbum que está en su colección
- **THEN** el sistema elimina la entrada de favoritos y confirma la operación

#### Scenario: Álbum no presente

- **WHEN** se intenta eliminar un álbum que no está en la colección
- **THEN** el sistema responde correctamente indicando que no estaba, y el cliente no lo trata como un fallo

### Requirement: Listado de la colección

El sistema DEBE listar los álbumes guardados del usuario con sus datos de álbum, emociones, actividades y formatos, ordenados del más reciente al más antiguo, sin mostrar las etiquetas personales en las tarjetas, y DEBE informar si la carga falla en lugar de quedarse cargando.

#### Scenario: Colección con álbumes

- **WHEN** el usuario abre su colección y tiene álbumes guardados
- **THEN** el sistema los muestra del más reciente al más antiguo junto con los datos del álbum

#### Scenario: Etiquetas ocultas en las tarjetas

- **WHEN** la persona ve las tarjetas de su colección
- **THEN** las tarjetas no muestran las etiquetas personales de cada álbum

#### Scenario: Colección vacía

- **WHEN** el usuario no tiene álbumes guardados
- **THEN** el sistema muestra el estado vacío y un acceso a la búsqueda

#### Scenario: Error al cargar la colección

- **WHEN** la carga de la colección falla
- **THEN** el sistema muestra un estado de error con la opción de reintentar, y no deja la pantalla cargando indefinidamente
