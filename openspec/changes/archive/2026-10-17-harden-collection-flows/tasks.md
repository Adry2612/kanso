# Tasks

## 1. Validación y errores en el servidor

- [x] 1.1 `toggleFavorite`: exigir `userId` y `album.id` (400), normalizar `feelings`/`activities`/`tags` como arrays, y devolver un 500 genérico sin `error.message`
- [x] 1.2 `removeFavorite`: exigir `userId` y `album.id` (400), hacer la eliminación idempotente (200 con `removed`) y devolver un 500 genérico

## 2. Cliente robusto

- [x] 2.1 `addFavorite`/`undoFavorite`: comprobar `res.ok` antes de leer el cuerpo y tolerar respuestas no-JSON
- [x] 2.2 `favorites/page.tsx`: `try/catch/finally` con `setLoading(false)` garantizado, `res.ok` comprobado, estado de error y botón de reintentar

## 3. Verificación

- [x] 3.1 `npx tsc --noEmit` y lint sin errores
- [x] 3.2 Probar por API: `toggleFavorite` sin `userId` → 400; `removeFavorite` de un álbum ausente → 200; y una carga de colección con fallo forzado → estado de error con reintento (no esqueleto infinito)
- [x] 3.3 `npm run build` completando
