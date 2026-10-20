# Proposal

## Why

La capa de amigos ya permite compartir un perfil mínimo y enviar solicitudes, pero un amigo solo ve el nombre y el avatar. La siguiente necesidad es poder consultar qué recomendaciones, álbumes y artistas comparte cada amigo, sin convertir la colección en un escaparate público ni exponer datos personales.

## What Changes

- Añadir una **biblioteca compartida entre amigos** con tres secciones independientes: recomendaciones e historial, álbumes/favoritos y artistas.
- Cada sección se activa de forma explícita y por separado; **todo queda privado por defecto** y las cuentas existentes se tratan como privadas sin migración.
- Añadir un **perfil privado de amigo** en `/friends/[uid]`, accesible desde la lista de amigos, con contenido de solo lectura y estados de carga, vacío y error.
- Añadir la configuración «Qué compartes» en `/friends` para activar o desactivar cada sección.
- Exponer una API autenticada `GET /api/friends/[uid]/library` que solo responde a amistades mutuas y solo devuelve las secciones activadas por la persona consultada.
- Añadir `PATCH /api/friends/sharing` para guardar las preferencias y ampliar `GET /api/friends` con la configuración propia.
- Mantener la vista pública `/f/<código>` sin cambios: seguirá mostrando solo nombre, avatar, relación y la acción de añadir. La colección nunca se servirá desde el QR público.
- No compartir etiquetas personales, correo, UID, notas ni ningún dato interno; la amistad por sí sola no abre la colección.

## Capabilities

### New Capabilities

- `friend-library`: configuración de compartición por sección, perfil privado de amigo y lectura autorizada de recomendaciones, álbumes y artistas compartidos.

### Modified Capabilities

<!-- Ninguna: la navegación y las capacidades de colección, recomendaciones y artistas conservan su comportamiento; la nueva capacidad se limita a leer datos ya existentes con autorización explícita. -->

## Impact

- Nueva página `src/app/friends/[uid]/page.tsx`, componentes de tarjeta de solo lectura y panel de privacidad en `/friends`.
- Nuevas rutas de API: `PATCH /api/friends/sharing`, `GET /api/friends/[uid]/library`.
- `GET /api/friends` devuelve la configuración `sharing` del perfil propio.
- Firestore: nuevo mapa `sharing` en `users/{uid}` con las tres secciones a `false` por defecto. Sin migración ni backfill.
- Reutiliza los datos existentes de `users/{uid}/recomendationHistory`, `users/{uid}/favorites` y `users/{uid}/artists`; no cambia sus contratos ni sus pantallas.
- Depende de `add-friends` (ya implementado en la rama). No añade dependencias npm.
- Las reglas de Firestore no cambian: todo sigue pasando por la API con privilegios.
