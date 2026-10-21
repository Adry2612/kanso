# Spec Delta

## Purpose

Permite compartir de forma granular recomendaciones, álbumes y artistas con amistades mutuas, manteniendo toda la biblioteca privada por defecto.

## ADDED Requirements

### Requirement: Configuración de compartición por sección

El sistema DEBE permitir activar o desactivar de forma independiente la compartición de recomendaciones, álbumes y artistas, y DEBE mantener las tres secciones privadas por defecto.

#### Scenario: Privacidad inicial

- **WHEN** una persona nunca ha configurado su biblioteca compartida
- **THEN** las tres secciones están desactivadas y ninguna amistad puede ver su contenido

#### Scenario: Activar una sección

- **WHEN** la persona activa la compartición de recomendaciones
- **THEN** la preferencia se guarda y solo esa sección pasa a estar disponible para sus amistades

#### Scenario: Desactivar una sección

- **WHEN** la persona desactiva una sección que estaba compartiendo
- **THEN** la sección deja de mostrarse en la siguiente consulta sin borrar los datos originales

#### Scenario: Invitado en la configuración

- **WHEN** una sesión de invitado intenta cambiar la configuración
- **THEN** el sistema deniega la operación y no guarda ninguna preferencia

### Requirement: Perfil privado de amigo

El sistema DEBE ofrecer un perfil privado en `/friends/[uid]` con el nombre, el avatar y solo las secciones que esa persona comparte. NO DEBE mostrarse a quien no sea amistad ni incluir correo, UID, código de invitación o datos internos.

#### Scenario: Amistad con contenido compartido

- **WHEN** una persona amiga abre el perfil privado de otra
- **THEN** ve su nombre, su avatar y únicamente las secciones activadas por la persona consultada

#### Scenario: Amistad sin contenido compartido

- **WHEN** la persona consultada no comparte ninguna sección
- **THEN** el perfil muestra un estado vacío y no revela ningún dato de su biblioteca

#### Scenario: Persona que no es amiga

- **WHEN** una persona registrada intenta abrir el perfil privado de alguien que no está en su lista de amigos
- **THEN** el sistema deniega el acceso con un mensaje genérico y no devuelve datos

#### Scenario: Sin sesión o invitado

- **WHEN** una persona sin sesión o con sesión de invitado abre el perfil privado
- **THEN** ve una invitación a entrar o crear una cuenta y no se solicita la biblioteca

### Requirement: Recomendaciones compartidas

El sistema DEBE mostrar en el perfil privado las recomendaciones que la persona haya decidido compartir, con portada, álbum, artistas, fecha y emociones o actividades, en modo solo lectura.

#### Scenario: Recomendaciones visibles

- **WHEN** la persona consultada comparte sus recomendaciones y tiene historial
- **THEN** el perfil muestra las recomendaciones con sus datos y sin acciones de edición

#### Scenario: Sin recomendaciones

- **WHEN** la persona comparte recomendaciones pero su historial está vacío
- **THEN** la sección muestra un estado vacío explicativo

#### Scenario: Sección desactivada

- **WHEN** la persona no comparte recomendaciones
- **THEN** el perfil no muestra ni consulta esa sección

### Requirement: Álbumes compartidos

El sistema DEBE mostrar los álbumes de la colección que la persona comparta, con portada, título, artistas, emociones, actividades y formato, en modo solo lectura. NO DEBE mostrar etiquetas personales ni permitir modificarlos.

#### Scenario: Álbumes visibles

- **WHEN** la persona consultada comparte su colección y tiene álbumes guardados
- **THEN** el perfil muestra las portadas y los datos permitidos sin acciones de edición ni borrado

#### Scenario: Etiquetas personales ocultas

- **WHEN** un álbum compartido tiene etiquetas personales
- **THEN** la respuesta y la interfaz no incluyen esas etiquetas

#### Scenario: Colección vacía

- **WHEN** la persona comparte su colección pero no tiene álbumes guardados
- **THEN** la sección muestra un estado vacío explicativo

#### Scenario: Colección desactivada

- **WHEN** la persona no comparte su colección
- **THEN** el perfil no muestra ni consulta los álbumes

### Requirement: Artistas compartidos

El sistema DEBE mostrar los artistas favoritos que la persona comparta, con nombre e imagen, en modo solo lectura.

#### Scenario: Artistas visibles

- **WHEN** la persona consultada comparte sus artistas y tiene favoritos
- **THEN** el perfil muestra los artistas con su nombre e imagen, sin acciones de edición

#### Scenario: Sin artistas

- **WHEN** la persona comparte artistas pero no tiene favoritos
- **THEN** la sección muestra un estado vacío explicativo

#### Scenario: Artistas desactivados

- **WHEN** la persona no comparte artistas
- **THEN** el perfil no muestra ni consulta esa sección

### Requirement: Autorización de la biblioteca compartida

La API DEBE derivar la identidad de quien consulta del token, comprobar que existe una amistad mutua y que la sección está activa antes de devolver datos. DEBE denegar a invitados y a quien no es amigo sin revelar datos.

#### Scenario: Amistad autorizada

- **WHEN** una amistad consulta la biblioteca de una persona que comparte al menos una sección
- **THEN** la API responde con las secciones activas y sin datos internos

#### Scenario: Persona que no es amiga

- **WHEN** una persona registrada consulta la biblioteca de alguien que no es su amistad
- **THEN** la API responde con un error de permiso genérico y no devuelve contenido

#### Scenario: Invitado o sin token

- **WHEN** una sesión de invitado o una petición sin token consulta la biblioteca
- **THEN** la API responde con un error de permiso y no crea ni devuelve datos

#### Scenario: Sección desactivada

- **WHEN** una amistad consulta una biblioteca con una sección desactivada
- **THEN** esa sección se omite aunque la amistad sea válida

#### Scenario: Amistad eliminada

- **WHEN** se elimina la amistad entre dos personas
- **THEN** la siguiente consulta al perfil privado se deniega

### Requirement: Privacidad del perfil público

La vista pública `/f/<código>` DEBE seguir mostrando solo nombre, avatar, relación y la acción de añadir. NO DEBE exponer la biblioteca compartida ni permitir consultarla sin amistad.

#### Scenario: Perfil público sin cambios

- **WHEN** alguien abre un enlace público de perfil
- **THEN** solo ve nombre, avatar, relación y la acción de añadir o el estado correspondiente

#### Scenario: Biblioteca fuera del QR

- **WHEN** alguien intenta usar un código público para consultar recomendaciones, álbumes o artistas
- **THEN** el sistema no ofrece esa información y la API de biblioteca exige amistad y sesión registrada

#### Scenario: Sin datos internos

- **WHEN** se consulta cualquier perfil compartido
- **THEN** la respuesta no incluye correo, UID, código de invitación, etiquetas personales ni notas

### Requirement: Acceso desde la lista de amigos

La lista de amigos DEBE ofrecer acceso al perfil privado de cada amistad y la configuración de compartición DEBE estar disponible desde `/friends`.

#### Scenario: Ver el perfil de una amistad

- **WHEN** la persona pulsa «Ver perfil» en una amistad
- **THEN** el sistema abre `/friends/[uid]` y mantiene «Amigos» como sección activa

#### Scenario: Volver a la lista

- **WHEN** la persona pulsa volver desde el perfil privado
- **THEN** regresa a `/friends` sin perder la configuración ni la lista

#### Scenario: Estado vacío del perfil

- **WHEN** la amistad no comparte ninguna sección
- **THEN** el perfil muestra un estado vacío y una acción para volver a la lista

#### Scenario: Error de carga

- **WHEN** la biblioteca no se puede cargar
- **THEN** el perfil muestra un error con la opción de reintentar y no queda cargando indefinidamente
