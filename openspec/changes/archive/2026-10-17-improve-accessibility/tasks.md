# Tasks

## 1. Contraste

- [x] 1.1 Cambiar `--collectify-mint` del tema claro a `#2c7a45` en `src/app/globals.css`

## 2. Nombres accesibles

- [x] 2.1 En `src/components/Header.tsx`, quitar el `aria-label` del botón de perfil y marcar el avatar como decorativo (`aria-hidden`)

## 3. Verificación

- [x] 3.1 Pasar Lighthouse (categoría Accesibilidad) en `/home`, `/search`, `/favorites` y `/releases` y comprobar que no hay fallos de contraste ni de nombre accesible
- [x] 3.2 `npx tsc --noEmit`, `npm run lint` y `npm run build` sin errores
