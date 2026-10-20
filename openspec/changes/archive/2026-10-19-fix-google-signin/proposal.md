# Proposal

## Why

El inicio de sesión con Google **no funciona**. El popup se completa, pero justo después `signInWithGoogle` llama a `saveUserToFirestore`, que escribe `users/{uid}` con el **SDK web** de Firestore. Las reglas del proyecto (`firestore.rules`, change `secure-api-and-firestore`) deniegan todo acceso directo del cliente (`allow read, write: if false`), así que `getDoc` lanza `permission-denied`, `signInWithGoogle` lo relanza y la persona ve "No hemos podido iniciar sesión con Google." aunque Firebase Authentication ya la haya autenticado. El modo invitado funciona porque no toca Firestore.

Detectado al aplicar `redesign-carrousel-feelings`; es ajeno a ese change (autenticación es otra capacidad).

Además, la spec `authentication` exige crear el perfil en Firestore, algo que:

- solo ocurría en el camino de Google,
- nunca ocurrió en el registro por correo (que también lo exigía en su scenario),
- y ya no puede ocurrir desde el cliente.

Y el documento `users/{uid}` **no lo lee nadie**: el resto de la app usa subcolecciones (`users/{uid}/favorites`, `…/artists`, `…/recomendationHistory`) a través de la API con el Admin SDK.

## What Changes

- **Quitar la escritura de Firestore del flujo de Google**: `signInWithGoogle` deja de llamar a `saveUserToFirestore`; se elimina la función y el import de `firebase/firestore` en `src/lib/firebaseAuth.js`.
- **Retirar el export muerto `db`** de `src/lib/firebase.js` (solo existía para esa escritura).
- **Actualizar la spec `authentication`**: se elimina la creación del perfil en Firestore de los requisitos de registro y de Google, porque no hay consumidor y el modelo de seguridad prohíbe la escritura de cliente.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `authentication`: el inicio de sesión con Google y el registro dejan de crear el documento `users/{uid}` en Firestore; la sesión se establece y se redirige sin depender de una escritura de cliente.

## Impact

- `src/lib/firebaseAuth.js` — sin `saveUserToFirestore` ni import de Firestore.
- `src/lib/firebase.js` — sin el export `db`.
- `openspec/specs/authentication/spec.md` — requisitos de Google y de registro ajustados (se sincronizan al archivar).

## Fuera de alcance

- Crear el perfil con el Admin SDK desde una ruta API (alternativa descartada; si algún día hace falta el documento, se crea así, nunca desde el cliente).
- Robustez del botón de Google si el popup se bloquea (hoy puede quedarse en "Cargando…" indefinidamente); queda como follow-up.
- Cambiar el proveedor, el dominio autorizado o la configuración de la consola de Firebase.
