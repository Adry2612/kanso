# Design

## Context

Ver `proposal.md` — Why. `favorites/page.tsx:37` no protege la carga; `toggleFavorite` y `removeFavorite` no validan `userId`/`album.id` y devuelven `error.message` interno; `removeFavorite` responde 404 cuando el álbum no está. El cliente `lib/api/favorites.ts` lee `res.json()` antes de comprobar `res.ok`.

## Goals / Non-Goals

**Goals:**

- Que ninguna carga de colección se quede colgada y siempre se pueda reintentar.
- Que el servidor rechace peticiones inválidas y no escriba bajo identificadores vacíos.
- Que quitar algo ausente no sea un error.

**Non-Goals:**

- Endurecer reglas de Firestore o mover la escritura a Admin SDK (va en `secure-api-and-firestore`).
- Rehacer la interfaz de la colección.
- Cambiar el formato de datos guardado.

## Decisions

### 1. Validación temprana en las rutas

Al principio de cada handler se comprueba `userId` (texto no vacío) y `album.id` (texto no vacío); si falta, 400 con mensaje claro, sin tocar Firestore. Las listas se normalizan con `Array.isArray` y filtros de tipo, de modo que un dato raro se descarta en lugar de tumbar la petición.

### 2. Errores genéricos hacia el cliente

El 500 devuelve un mensaje fijo ("No se pudo guardar/eliminar el álbum"); el detalle real se registra con `console.error`. Así el cliente muestra algo útil sin exponer internals.

**Alternativas consideradas**

- _Seguir devolviendo `error.message`_: cómodo para depurar, pero filtra rutas y detalles internos. Descartada; el log ya basta.

### 3. Eliminación idempotente

`removeFavorite` responde 200 con `removed: true|false`. Quitar lo que ya no está es un no-op correcto, no un fallo; el cliente no lanza.

### 4. Cliente que no asume JSON

`addFavorite`/`undoFavorite` leen el cuerpo con un `try/catch` de parseo y comprueban `res.ok` antes de decidir; si el cuerpo no es JSON, usan un mensaje por defecto. Así una respuesta de proxy/error HTML no se convierte en un `SyntaxError` críptico.

### 5. Estado de error con reintento en la colección

`fetchFavorites` se envuelve en `try/catch/finally` con `setLoading(false)` garantizado, guarda un `error` y la pantalla pinta un estado de error con botón "Reintentar" que vuelve a llamar a la carga.

## Risks / Trade-offs

- [Cambiar a 200 en la eliminación ausente] → actualiza la spec; el cliente ya no distingue "no estaba" de un fallo, que es lo deseado.
- [Validación estricta de `album.id`] → si algún llamador enviaba el álbum sin `id`, ahora recibe 400; se revisa que todos los llamadores envían un id de Spotify.

## Migration Plan

Sin migración de datos. Cambio de comportamiento en respuestas de error. Despliegue normal.

## Open Questions

- ¿La entrada de `communityAlbums` debería borrarse al quitar un favorito? Hoy se conserva (el álbum se añadió en algún momento). Se deja como está; se puede revisar aparte.
