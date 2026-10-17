# Proposal

## Why

El flujo de la colección tiene grietas que se notan en el uso diario:

1. **La colección se queda colgada si falla la carga.** `favorites/page.tsx` hace `fetch` sin `try/catch` ni comprobación de `res.ok`; si la petición falla, el `setLoading(false)` nunca se ejecuta y la página se queda en el esqueleto **para siempre**, sin mensaje ni forma de reintentar.
2. **Validación de servidor incompleta.** `toggleFavorite` y `removeFavorite` no comprueban `userId` ni `album.id`: una petición sin ellos escribe bajo `users/undefined` o consulta con `undefined`. `feelings`/`activities` se asumen arrays.
3. **Errores que filtran tripas.** Las dos rutas devuelven `error.message` interno con un 500.
4. **Quitar algo que no está es un error.** `removeFavorite` responde 404 y el cliente lanza excepción: quitar un álbum ya ausente debería ser inofensivo.

## What Changes

- **Listado robusto**: la colección envuelve la carga en `try/catch/finally`, comprueba `res.ok` y, si falla, muestra un **estado de error con botón de reintentar** en lugar de quedarse cargando.
- **Validación de entrada** en `toggleFavorite` y `removeFavorite`: `userId` y `album.id` obligatorios (400 con mensaje claro); `feelings`, `activities` y `tags` normalizados como arrays, ignorando lo inválido.
- **Eliminación idempotente**: quitar un álbum que no está responde 200 indicando que no estaba, en vez de 404.
- **Errores sin tripas**: los 500 devuelven un mensaje genérico; el detalle queda solo en el log del servidor.
- **Cliente tolerante**: `addFavorite`/`undoFavorite` comprueban `res.ok` antes de leer el JSON y toleran respuestas no-JSON, con mensajes claros.

## Capabilities

### Modified Capabilities

- `album-collection`: la colección valida las peticiones, informa de lo que no está sin tratarlo como error, y muestra un estado de error con reintento si la carga falla.

## Impact

- `src/app/api/toggleFavorite/route.ts`, `src/app/api/removeFavorite/route.ts`.
- `src/lib/api/favorites.ts`.
- `src/app/favorites/page.tsx`.
