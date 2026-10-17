# Tasks

## 1. Token de Spotify

- [x] 1.1 Cachear el token en memoria con caducidad (`expires_in` − 60 s) y deduplicar peticiones concurrentes en `services/spotify.ts`
- [x] 1.2 Quitar los `console.log` del camino del token (dejar los de error)

## 2. Imágenes

- [x] 2.1 Añadir `loading="lazy" decoding="async"` a las portadas
- [x] 2.2 Marcar la portada principal de la ficha de álbum con prioridad alta (sin lazy)

## 3. Dependencias

- [x] 3.1 Quitar `colorthief` y `@fortawesome/*` de `package.json` y actualizar el lockfile

## 4. Verificación

- [x] 4.1 Probar que dos peticiones seguidas a `/api/search` solo piden un token (una vez)
- [x] 4.2 `npx tsc --noEmit`, `npm run lint` y `npm run build` sin errores
