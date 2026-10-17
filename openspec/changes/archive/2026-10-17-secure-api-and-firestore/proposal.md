# Proposal

## Why

Dos agujeros graves, confirmados en el código:

1. **La API se fía de un `userId` que llega del cliente.** Ninguna de las 19 rutas verifica identidad: no hay `verifyIdToken`, ni `Authorization: Bearer`, ni Admin SDK. Cambiar el uid de la URL o del body basta para **leer o escribir los datos de otra persona** (`/api/userFavorites?userId=…`, `/api/toggleFavorite`, `/api/saveRecomendationHistory`, `/api/artistReleases`, …).
2. **Firestore está abierto.** No hay `firestore.rules` ni `firebase.json` en el repo, y **todo el acceso se hace con el SDK web sin contexto de usuario** (14 ficheros de servidor). Como la app funciona, las reglas del proyecto permiten peticiones sin autenticar: con la configuración pública del proyecto, cualquiera puede **leer o escribir toda la base de datos** saltándose la app.

Detalle favorable: el cliente **no** escribe directo a Firestore, así que se puede dejar la API como única puerta. La excepción es una **lectura** (`getRecommendedAlbumByActivity`), que hay que mover a la API antes de cerrar las reglas.

## What Changes

- **Verificación de identidad en la API con el Admin SDK**: cada ruta protegida exige un ID token de Firebase válido y **deriva el `userId` del token**, ignorando el que envíe el cliente. Sin token → 401.
- **Cierre de las reglas de Firestore** (`allow read, write: if false`), de modo que el único acceso sea la API con privilegios. Se añaden `firestore.rules`, `firebase.json` y `.firebaserc` al repositorio.
- **Mover a la API** la última lectura de Firestore que hoy puede ejecutarse en el cliente.
- **Cliente autenticado**: las llamadas a la API adjuntan el ID token (`Authorization: Bearer`).
- **Reactivar el acceso como invitado** (interruptor en la consola de Firebase; la app ya lo soporta).

## Capabilities

### New Capabilities

- `api-security`: la API verifica la identidad y deriva el usuario del token; las reglas de Firestore deniegan el acceso directo del cliente.

## Impact

- Nueva utilidad de servidor (Admin SDK) y adaptación de las ~19 rutas de `src/app/api`.
- Cliente: helper de fetch autenticado y su uso en las llamadas a la API.
- Nuevos ficheros de configuración de Firebase (`firestore.rules`, `firebase.json`, `.firebaserc`).
- `.env.example` y `.gitignore` (credenciales del Admin SDK).
- `package.json`: dependencia `firebase-admin`.

## Prerrequisito bloqueante (decisión del usuario)

- **Service account**: hace falta una clave de servicio del proyecto `collectify-2d503` en `.env` (server-only) para inicializar el Admin SDK. Sin ella no se puede implementar ni verificar este change.
- **Desplegar las reglas**: requiere `firebase-tools` autenticado (o aplicarlas a mano en la consola).
- **Activar Anónimo** en Authentication para el modo invitado.
