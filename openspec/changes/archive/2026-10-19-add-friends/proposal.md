# Proposal

## Why

Kanso hoy es una experiencia individual: se puede guardar, ordenar y filtrar la propia colección, pero no hay forma de conectar con otras personas. Compartir un perfil por QR permite añadir amigos sin buscar por email ni exponer identificadores internos, y abre una capa social ligera sin convertir la colección en un escaparate público.

## What Changes

- Nueva ruta privada `/friends` con lista de amigos, solicitudes pendientes (entrantes y salientes), alta por código y acceso a compartir el perfil.
- Cada cuenta registrada obtiene un **código de invitación** corto y aleatorio y un **perfil mínimo** (nombre y avatar). El código se comparte como QR o como enlace corto `/f/<código>`.
- Vista pública mínima `/f/<código>`: nombre, avatar y acción de añadir. Sin sesión, invita a entrar o registrarse; nunca muestra email ni colección.
- Flujo de amistad: enviar solicitud, aceptar o rechazar, listar amigos y eliminar. Si dos personas se envían solicitud a la vez, se resuelve como aceptación.
- Amigos solo para cuentas registradas: las sesiones de invitado ven una invitación a crear cuenta, porque son temporales.
- **Sin búsqueda por email ni por UID**: el código es la única vía de descubrimiento.
- Entrada «Amigos» en el panel lateral.
- Dependencia nueva `qrcode.react` para dibujar el QR en el cliente, sin enviar el enlace a servicios externos.
- La privacidad de la colección no cambia: un amigo no puede ver favoritos, artistas ni historial en este cambio.

## Capabilities

### New Capabilities

- `friends`: perfil compartible, código de invitación, QR, solicitudes, lista de amigos, privacidad del perfil y acceso restringido a cuentas registradas.

### Modified Capabilities

- `navigation`: el panel lateral añade «Amigos»; las páginas públicas incluyen la vista de perfil compartido `/f/*`.

## Impact

- Nueva UI: `src/app/friends/**`, `src/app/f/[code]/**` y componentes de tarjeta y modal de QR.
- Nuevas rutas de API: perfil propio, perfil público por código, envío y respuesta de solicitudes, lista de amigos y borrado.
- Firestore: `users/{uid}` (perfil), `friendCodes/{code}`, `friendRequests/{id}` y `users/{uid}/friends/{friendUid}`. Sin migración: el perfil se crea de forma perezosa.
- `src/lib/apiAuth.ts`: exponer si la sesión es anónima para poder bloquear amigos.
- `Header.tsx`, locales `es` y `en`, y estilos de perfil y QR.
- Dependencia `qrcode.react`.
- Las reglas de Firestore no cambian: todo sigue pasando por la API.

## Fuera de alcance

- Búsqueda por `@usuario` o por email.
- Ver la colección, los favoritos o el historial de otra persona.
- Notificaciones push o en tiempo real, bloqueo de usuarios, rotación del código y feed de actividad.
