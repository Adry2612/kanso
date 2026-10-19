# Design

## Context

Ver `proposal.md` — Why. Restricciones actuales que condicionan el enfoque:

- La identidad vive en Firebase Authentication; no existe documento `users/{uid}`. Los datos personales cuelgan de subcolecciones (`favorites`, `artists`, `recomendationHistory`).
- El cliente no accede a Firestore: todas las lecturas y escrituras pasan por la API con Admin SDK y las reglas deniegan todo.
- `authenticate()` deriva el `uid` del ID token y no expone si la sesión es anónima.
- El armazón oculta el panel lateral en `/` y `/login`; el resto de páginas privadas lo muestran.
- Ya existen `ModalShell`, las primitivas de `motion` y el sistema de tokens; la UI nueva debe reutilizarlos.
- La internacionalización es por namespaces en `src/locales/es.json` y `en.json`.

## Goals / Non-Goals

**Goals:**

- Añadir una capa social mínima sin tocar la privacidad de la colección.
- Descubrimiento solo por código/QR, sin búsqueda por email ni por UID.
- Crear el perfil de forma perezosa: sin migración ni backfill.
- Mantener todas las escrituras en la API y las reglas de Firestore cerradas.

**Non-Goals:**

- Ver colecciones, favoritos o historial ajenos.
- Búsqueda por `@usuario`, email o directorio público.
- Notificaciones en tiempo real, bloqueo, rotación de código o feed de actividad.
- Cambiar el modelo de autenticación más allá de saber si la sesión es anónima.

## Decisions

### 1. Código de invitación aleatorio, no UID ni email

Cada perfil recibe un código de 8 caracteres en base32 sin caracteres ambiguos (`23456789ABCDEFGHJKLMNPQRSTUVWXYZ`). Se reserva en `friendCodes/{code}` con el `uid` como valor, de modo que la unicidad la garantiza el ID del documento y la búsqueda es un `get` directo.

Alternativas descartadas:

- **UID**: es un identificador interno estable; compartirlo permite correlacionar cuentas y no se puede revocar.
- **Email**: obliga a revelar un dato personal y a una búsqueda exacta; peor privacidad y más fricción.
- **Handle público**: exige onboarding, validación y reserva de nombres; se puede añadir más adelante sin romper este modelo.

### 2. Perfil en `users/{uid}`, creado al abrir Amigos

Documento con `displayName`, `photoURL`, `friendCode`, `createdAt` y `updatedAt`. Se crea la primera vez que una cuenta registrada abre `/friends` o comparte su perfil. En cada lectura propia se refrescan `displayName` y `photoURL` desde Firebase Auth para que un cambio de nombre o avatar se refleje sin migración.

Alternativas descartadas:

- **Leer siempre de Firebase Auth**: impide guardar el código y no permite listar amigos con un solo `get`.
- **Crear el perfil en el registro**: obliga a tocar el flujo de alta y deja perfiles vacíos para quien nunca use amigos.

### 3. Amistad en dos documentos, solicitudes con ID determinista

- `friendRequests/{fromUid}_{toUid}`: una solicitud por dirección; el ID evita duplicados sin consultas.
- `users/{uid}/friends/{friendUid}`: la amistad se escribe en ambos sentidos dentro de un batch, de modo que listar amigos es una sola lectura de subcolección.
- Al aceptar, el batch crea los dos documentos de amistad y borra la solicitud. Al rechazar, solo borra la solicitud.
- Si A envía a B y B ya tenía una solicitud pendiente hacia A, se aceptan mutuamente sin crear otra.

Alternativa descartada: una colección `friendships/{pairId}` con dos lecturas o un índice compuesto; la subcolección por usuario simplifica la lista y el borrado.

### 4. Vista pública mínima en `/f/[code]`

Página independiente, sin panel lateral, que muestra nombre, avatar y la acción de añadir. La sirve una ruta pública `GET /api/publicProfile?code=...` que devuelve solo campos públicos y, si la petición lleva token válido, la relación con esa persona (`none`, `pending`, `friend`). Sin token, la acción de añadir invita a entrar o registrarse y vuelve a la misma URL.

El código es una capacidad: quien lo tiene puede ver el perfil mínimo y enviar una solicitud. No se indexa, no se cachea y los errores son genéricos para no confirmar códigos ajenos.

### 5. Invitados fuera de amigos

`authenticate()` pasa a devolver `isAnonymous`, derivado de `decoded.firebase.sign_in_provider === "anonymous"`. Un helper `requireRegistered()` responde 403 en las rutas de amigos. En la UI, `/friends` muestra una invitación a crear cuenta en lugar de la lista.

Alternativas descartadas:

- **Comprobar solo en el cliente**: se puede saltar llamando a la API.
- **Consultar `getUser()` en cada petición**: añade una llamada de red y no aporta frente al claim del token.

### 6. QR dibujado en el cliente

`qrcode.react` renderiza el QR como SVG en el modal de compartir. El enlace se construye con `window.location.origin` y `/f/<código>`; no se envía a ningún servicio de generación de QR. Se ofrece copiar el enlace y, si el navegador lo soporta, la hoja nativa de compartir.

Alternativas descartadas: una API externa de QR (filtra el enlace) y generar el SVG en servidor (más código y sin ventaja para un QR estático).

### 7. API y UI

Rutas:

- `GET /api/friends` — perfil propio, amigos y solicitudes entrantes/salientes.
- `POST /api/friends/requests` — enviar solicitud por código.
- `PATCH /api/friends/requests/[id]` — aceptar o rechazar (solo la destinataria).
- `DELETE /api/friends/[uid]` — eliminar amistad.
- `GET /api/publicProfile?code=` — perfil público mínimo.

La página `/friends` reutiliza `kanso-panel`, `Reveal` y `ModalShell`; el modal de QR muestra el código, el enlace y las acciones. La entrada del panel usa `UsersRound` (Artistas ya usa `Users`) y se añade al namespace `friends` de los dos locales.

## Risks / Trade-offs

- [Enumeración de códigos] → 40 bits de entropía, errores genéricos y sin listados públicos; rate limiting queda como follow-up.
- [El enlace del QR expone el perfil a quien lo tenga] → solo nombre y avatar; la colección nunca se incluye. La rotación del código queda fuera de alcance.
- [Los invitados no pueden usar amigos] → se explica con una CTA clara; es preferible a prometer amistades que se pierden al cerrar la sesión.
- [Creación perezosa concurrente] → reservar el código en una transacción y usar el `uid` como ID del perfil evita duplicados.
- [Spam de solicitudes] → solo la destinataria puede aceptar; bloqueo y límites de frecuencia quedan como follow-up.
- [Datos de amigo desactualizados] → el nombre y el avatar se refrescan al leer el perfil propio; la lista muestra la última copia guardada, sin tiempo real.

## Migration Plan

No hay migración de datos. El perfil se crea al primer uso y los códigos se reservan en `friendCodes`. Rollback: retirar la ruta y la entrada de navegación; los documentos creados son inertes y no afectan al resto de la aplicación.
