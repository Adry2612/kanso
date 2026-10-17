# Design

## Context

Ver `proposal.md` — Why. `getAccessToken()` se llama en 9 sitios y cada llamada hace un `POST` a `accounts.spotify.com/api/token`. Los 12 `<img>` no declaran `loading`/`decoding`. `package.json` arrastra `colorthief` y `@fortawesome/*` sin un solo import.

## Goals / Non-Goals

**Goals:**

- Un solo token por instancia y por ventana de validez.
- Imágenes fuera de pantalla que no compiten con la primera carga.
- Quitar peso muerto de dependencias.

**Non-Goals:**

- Migrar a `next/image` (exige configurar dominios remotos; se evalúa aparte).
- Reestructurar componentes cliente/servidor.
- Lazy-load de modales (posible siguiente paso, no en este change).

## Decisions

### 1. Caché de token en memoria con deduplicación

Se guarda `{ value, expiresAt }` en el módulo, con caducidad basada en `expires_in` menos un margen (60 s). Si hay una petición de token en curso, las demás esperan a la misma promesa (`tokenPromise`), evitando ráfagas en el arranque.

**Alternativas consideradas**

- _Cachear en Firestore/Redis_: reparto entre instancias, pero añade I/O y complejidad; el token es por credencial de app, no por usuario. Descartada por ahora.
- _No hacer nada_: se mantiene el coste por petición y el riesgo de límite de Spotify. Descartada.

### 2. Pistas de carga en las portadas

`loading="lazy" decoding="async"` en todas las portadas salvo la principal de la ficha de álbum, que es lo primero que se ve y se marca con prioridad alta (`fetchPriority="high"`).

### 3. Quitar dependencias por evidencia

Solo se quitan paquetes con **0 imports** en `src/` y `services/`: `colorthief`, `@fortawesome/react-fontawesome`, `@fortawesome/fontawesome-svg-core`. `react-icons` y `lucide-react` se quedan: ambas se usan.

## Risks / Trade-offs

- [Un token caducado en memoria] → margen de 60 s antes de la expiración real.
- [`loading="lazy"` en la portada principal] → se excluye explícitamente esa.
- [Quitar una dependencia que se importa de forma dinámica] → se comprueba con `grep` y lo valida el build.

## Migration Plan

Sin migración. Reinicio del servidor para soltar la caché. Despliegue normal.

## Open Questions

- ¿Merece la pena `next/image` con `remotePatterns` para `i.scdn.co`? Se decide en un change futuro si el LCP lo pide.
