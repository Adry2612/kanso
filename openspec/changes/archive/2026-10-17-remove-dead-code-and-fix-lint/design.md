# Design

## Context

Ver `proposal.md` — Why. El análisis de importadores deja cinco ficheros sin ningún uso (`LanguageSwitcher`, `heartButton`, `i18n/routing`, `lib/recomendations/recomendations.ts`) y cuatro rutas de `/home/*` huérfanas. `i18n.ts` es entry point de next-intl (lo carga `next.config`), así que no es muerto. `/recomendation` es un `redirect` deliberado y se conserva.

## Goals / Non-Goals

**Goals:**

- Quitar el código que nadie usa.
- Dejar el lint sin warnings accionables.

**Non-Goals:**

- Tocar la lógica de la recomendación actual ni la interfaz.
- Eliminar next-intl ni el redirect heredado.
- Activar el cambio de idioma (va en `enable-language-switching`).

## Decisions

### 1. Borrar por evidencia de importadores, no por sospecha

Solo se borra lo que no importa nadie: `heartButton` y `LanguageSwitcher` (0 usos), `lib/recomendations/recomendations.ts` (0 usos), las cuatro rutas `/home/*` (sin enlaces externos) y `GridSelector` (solo lo usaban esas rutas). `/recomendation` y el andamiaje de next-intl se quedan, porque cumplen una función aunque hoy no tengan importadores.

### 2. `any` → tipos concretos

En rutas de API y utilidades se sustituye `any` por interfaces concretas o `unknown` según el caso, para que el tipo exprese la intención en lugar de silenciar el compilador.

### 3. `<img>` de portadas

Las portadas vienen de CDNs de Spotify con dominios variados. En lugar de migrar a `next/image` (que exige configurar dominios y puede afectar al rendimiento real), se deja `<img>` con una excepción local y una nota que apunta a `improve-performance`, donde se decidirá la optimización de imágenes.

**Alternativas consideradas**

- _Migrar a `next/image` ahora_: pertenece a `improve-performance` y toca configuración de dominios remotos. Descartada aquí.

## Risks / Trade-offs

- [Borrar algo que sí se usaba por una vía no detectada] → se confirma por importadores y por búsqueda de enlaces antes de borrar, y `tsc` + build lo validan después.
- [Cambiar deps de hooks y alterar comportamiento] → solo se corrige donde es seguro; donde no, se documenta la excepción.

## Migration Plan

Sin migración. Si alguien tenía marcada la URL antigua `/home/mood`, ya no existirá; las URLs actuales (`/home`, `/recommendation`) no cambian.

## Open Questions

- Ninguna.
