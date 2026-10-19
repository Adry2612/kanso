# friends Specification

## Purpose

Permite conectar con otras personas mediante un perfil mínimo compartible por código o QR, sin exponer datos personales ni la colección, y gestionar solicitudes y amistades.

## Requirements

### Requirement: Perfil compartible y código de invitación

Toda cuenta registrada DEBE tener un perfil mínimo con nombre, avatar y un código de invitación corto y aleatorio. El código DEBE ser la única vía para encontrar a otra persona y NO DEBE derivarse del UID ni del correo.

#### Scenario: Creación perezosa del perfil

- **WHEN** una persona registrada abre Amigos por primera vez
- **THEN** el sistema crea su perfil y su código sin pedirle datos adicionales

#### Scenario: Código no adivinable

- **WHEN** se genera un código de invitación
- **THEN** es aleatorio y no coincide con el UID ni contiene el correo de la persona

### Requirement: Compartir el perfil por QR

El sistema DEBE permitir compartir el perfil mediante un QR y un enlace corto que apunten a la vista pública del perfil, y DEBE ofrecer copiar ese enlace.

#### Scenario: Abrir el panel de compartir

- **WHEN** la persona pulsa «Compartir perfil»
- **THEN** ve el QR, el enlace corto y una acción para copiarlo

#### Scenario: QR generado en el cliente

- **WHEN** se muestra el QR
- **THEN** se dibuja en el navegador sin enviar el enlace a un servicio externo

#### Scenario: Copiar el enlace

- **WHEN** la persona pulsa copiar
- **THEN** el enlace queda en el portapapeles y el sistema confirma la acción

### Requirement: Vista pública mínima del perfil

La vista `/f/<código>` DEBE mostrar solo el nombre, el avatar y la acción de añadir. NO DEBE mostrar correo, UID, colección, artistas ni historial.

#### Scenario: Perfil válido

- **WHEN** la persona abre un enlace con un código válido
- **THEN** ve el nombre, el avatar y la acción de añadir a amigos

#### Scenario: Código inexistente

- **WHEN** la persona abre un código que no existe
- **THEN** ve un mensaje de perfil no encontrado sin revelar si el código existió

#### Scenario: Visita sin sesión

- **WHEN** la persona abre el perfil sin haber iniciado sesión
- **THEN** ve el perfil y una invitación a entrar o registrarse para añadirlo

#### Scenario: Solo datos públicos

- **WHEN** cualquier persona abre la vista pública
- **THEN** no se muestra el correo, el UID ni ningún dato de la colección

### Requirement: Enviar solicitud de amistad

Una persona registrada DEBE poder enviar una solicitud usando el código de otra. El sistema DEBE impedir solicitudes a uno mismo, duplicadas o a quien ya es amigo.

#### Scenario: Envío correcto

- **WHEN** la persona envía una solicitud con un código válido
- **THEN** la destinataria ve la solicitud pendiente y la emisora ve la solicitud enviada

#### Scenario: Ya son amigos

- **WHEN** la persona intenta añadir a alguien que ya está en su lista
- **THEN** el sistema no crea otra solicitud y lo indica con claridad

#### Scenario: Código propio

- **WHEN** la persona usa su propio código
- **THEN** el sistema rechaza la solicitud con un mensaje claro

#### Scenario: Código inexistente

- **WHEN** la persona usa un código que no existe
- **THEN** el sistema responde con un error genérico sin revelar códigos ajenos

#### Scenario: Solicitud recíproca

- **WHEN** dos personas se envían una solicitud mutuamente
- **THEN** el sistema las convierte en amigas sin dejar solicitudes pendientes

### Requirement: Aceptar o rechazar solicitudes

La persona destinataria DEBE poder aceptar o rechazar una solicitud pendiente. Aceptar DEBE crear la amistad en ambos sentidos; rechazar DEBE retirar la solicitud sin crear amistad.

#### Scenario: Aceptar una solicitud

- **WHEN** la destinataria acepta
- **THEN** ambas personas aparecen en la lista de amigos de la otra y la solicitud desaparece

#### Scenario: Rechazar una solicitud

- **WHEN** la destinataria rechaza
- **THEN** la solicitud desaparece y no se crea ninguna amistad

#### Scenario: Solo la destinataria responde

- **WHEN** una persona distinta de la destinataria intenta responder
- **THEN** el sistema deniega la operación

### Requirement: Lista de amigos y eliminación

El sistema DEBE listar los amigos con su nombre y avatar, y DEBE permitir eliminar una amistad. Al eliminarla, DEBE desaparecer de las listas de ambas personas.

#### Scenario: Consultar la lista

- **WHEN** la persona abre Amigos
- **THEN** ve sus amigos y sus solicitudes pendientes separadas

#### Scenario: Eliminar una amistad

- **WHEN** la persona elimina a un amigo
- **THEN** la amistad desaparece para ambas y se puede volver a enviar una solicitud más adelante

#### Scenario: Lista vacía

- **WHEN** la persona todavía no tiene amigos
- **THEN** ve un estado vacío con la acción de compartir su perfil

### Requirement: Privacidad del perfil y de la colección

El perfil compartido NO DEBE incluir correo, UID, favoritos, artistas ni historial. La amistad no concede acceso a la colección en este cambio.

#### Scenario: Datos visibles de un amigo

- **WHEN** la persona consulta el perfil de un amigo
- **THEN** solo ve nombre, avatar y la relación de amistad

#### Scenario: Colección ajena

- **WHEN** dos personas son amigas
- **THEN** ninguna puede ver los favoritos, artistas o historial de la otra

### Requirement: Acceso solo para cuentas registradas

Las sesiones de invitado NO DEBEN poder crear perfil, compartir el QR ni enviar o aceptar solicitudes. DEBEN ver una invitación a crear una cuenta.

#### Scenario: Invitado en Amigos

- **WHEN** una sesión de invitado abre `/friends`
- **THEN** ve una invitación a crear cuenta en lugar de la lista de amigos

#### Scenario: Invitado en el perfil público

- **WHEN** una sesión de invitado abre `/f/<código>`
- **THEN** ve el perfil y la acción de añadir le invita a crear una cuenta

#### Scenario: API de amigos

- **WHEN** una sesión de invitado llama a una ruta de amigos
- **THEN** la API responde con un error de permiso y no crea ningún dato
