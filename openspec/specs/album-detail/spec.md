# Detalle de álbum

## Purpose

Muestra la información completa de un álbum (portada, metadatos y lista de pistas) con un fondo derivado de los colores de la portada, y permite gestionar su pertenencia a la colección.

## Requirements

### Requirement: Visualización del detalle

El sistema DEBE mostrar la portada, el nombre y los artistas del álbum seleccionado.

#### Scenario: Carga del detalle

- **WHEN** la persona abre `/albums/{albumId}`
- **THEN** el sistema muestra la portada, el nombre y los artistas del álbum

### Requirement: Fondo dinámico según la portada

El sistema DEBE generar un degradado de fondo a partir del color dominante de la portada del álbum.

#### Scenario: Color dominante aplicado

- **WHEN** la portada del álbum termina de cargar
- **THEN** el sistema aplica un degradado basado en su color dominante

#### Scenario: Color no disponible

- **WHEN** no se puede extraer el color de la portada
- **THEN** el sistema mantiene un color de fondo por defecto

### Requirement: Lista de pistas

El sistema DEBE mostrar la lista de pistas del álbum numerada, con el nombre y los artistas de cada pista.

#### Scenario: Álbum con pistas

- **WHEN** el álbum tiene pistas
- **THEN** el sistema las muestra numeradas con su nombre y artistas

#### Scenario: Álbum sin pistas

- **WHEN** el álbum no tiene pistas
- **THEN** el sistema muestra el mensaje de que no hay pistas

### Requirement: Estado de colección en el detalle

El sistema DEBE indicar si el álbum está en la colección del usuario y mostrar sus emociones, formatos, actividades y etiquetas guardadas.

#### Scenario: Álbum en la colección

- **WHEN** el álbum forma parte de la colección
- **THEN** el sistema muestra sus emociones, formatos, actividades y etiquetas

#### Scenario: Álbum fuera de la colección

- **WHEN** el álbum no forma parte de la colección
- **THEN** el sistema ofrece añadirlo a la colección

### Requirement: Gestión de la colección desde el detalle

El sistema DEBE permitir añadir, editar y eliminar el álbum de la colección desde el detalle.

#### Scenario: Editar información

- **WHEN** la persona pulsa "Editar colección" en un álbum guardado
- **THEN** el sistema abre el asistente de guardado en modo edición con los datos actuales

#### Scenario: Eliminar del detalle

- **WHEN** la persona pulsa "Eliminar de la colección"
- **THEN** el sistema elimina el álbum de la colección sin pasos de confirmación adicionales

### Requirement: Reproducción en Spotify

El sistema DEBE ofrecer abrir el álbum en Spotify.

#### Scenario: Apertura en Spotify

- **WHEN** la persona pulsa "Escuchar en Spotify"
- **THEN** el sistema intenta abrir la aplicación de Spotify y usa la web como alternativa

### Requirement: Navegación de regreso

El sistema DEBE ofrecer volver a la pantalla anterior desde el detalle.

#### Scenario: Volver

- **WHEN** la persona pulsa "Volver"
- **THEN** el sistema regresa a la pantalla anterior del historial de navegación
