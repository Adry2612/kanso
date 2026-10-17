# Design

## Context

Ver `proposal.md` — Why. La API confía en el `userId` del cliente (19 rutas, 0 verificaciones). Firestore no tiene reglas en el repo y todo el acceso se hace con el SDK web **sin autenticar**, lo que implica reglas permisivas en `collectify-2d503`. El cliente no escribe directo a Firestore salvo una lectura (`getRecommendedAlbumByActivity`).

## Goals / Non-Goals

**Goals:**

- Que nadie pueda operar sobre los datos de otra persona a través de la API.
- Que el acceso directo del cliente a Firestore quede cerrado.
- Dejar la configuración de Firebase versionada en el repo.

**Non-Goals:**

- Mover toda la lógica de datos al cliente (se va en la dirección contraria).
- Rehacer la autenticación de la app (correo, Google e invitado siguen igual).
- App Check (se puede añadir después, sobre esta base).

## Decisions

### 1. Admin SDK en el servidor, identidad derivada del token

Se inicializa `firebase-admin` con una **service account** leída de `.env` (JSON en una variable o ruta a un fichero, ambos server-only). Un helper `requireUser(request)`:
1. lee `Authorization: Bearer <idToken>`;
2. verifica el token con el Admin SDK;
3. devuelve el `uid` verificado o lanza 401.

Las rutas dejan de leer `userId` del query/body: lo toman del token. Así, aunque el cliente envíe otro uid, se ignora.

**Alternativas consideradas**

- _Seguir con el SDK web desde el servidor_: mantiene el acceso sin autenticar y obliga a reglas permisivas. Descartada.
- _Verificación por JWKS sin Admin SDK_: evita la service account, pero no resuelve el acceso del servidor a Firestore con reglas cerradas (haría falta igualmente el Admin SDK). Descartada por incompleta.
- _Reglas por usuario en vez de cerrar del todo_: dejaría el acceso del servidor sin resolver y mantendría la superficie. Descartada.

### 2. Reglas que deniegan el acceso directo

`firestore.rules` con `allow read, write: if false` para todo. La API es la única puerta, usando privilegios que las reglas no limitan. Se versionan `firestore.rules`, `firebase.json` y `.firebaserc`.

### 3. Mover la lectura de cliente a la API

`getRecommendedAlbumByActivity` (Firestore directo) pasa a resolverse en el servidor, de modo que al cerrar las reglas no se rompa el flujo de recomendación.

### 4. El cliente adjunta el token

Un helper de fetch añade `Authorization: Bearer <idToken>` obtenido de Firebase Auth (`getIdToken()`). Si no hay sesión, la petición no se hace.

### 5. Invitado = interruptor de consola

El código de invitado ya existe y ya muestra un mensaje claro cuando está desactivado (`guestSignInError.ts`). Reactivarlo es **activar "Anónimo"** en Authentication; no hay cambio de código.

## Risks / Trade-offs

- [Sin la service account, la app no puede autenticar] → es un **prerrequisito explícito**; no se implementa ni se verifica hasta tenerla. Se evita dejar una vía insegura de respaldo.
- [Cerrar las reglas rompe cualquier lectura de cliente que se me escape] → se audita el código antes de cerrar y se mueve la lectura detectada.
- [Tokens caducan] → `getIdToken()` los renueva; el helper lo pide en cada llamada.

## Migration Plan

1. Crear la service account y añadirla a `.env`.
2. Desplegar `firestore.rules` (CLI o consola).
3. Desplegar el código (cliente + API).
4. Activar Anónimo en Authentication.

Orden pensado para no dejar ventanas inseguras: primero identificar y mover la lectura de cliente, después cerrar reglas y desplegar API+cliente juntos.

## Open Questions

- ¿La service account irá como JSON en variable de entorno o como fichero referenciado por ruta? (se soportan ambas).
- ¿Se activa App Check en un change posterior?
