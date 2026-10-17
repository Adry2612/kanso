# Proposal

## Why

La pantalla de inicio y el selector de emociones/actividad no convencen, por causas concretas:

1. **Ilegibles en el tema claro.** Las tarjetas usan colores de la paleta oscura sobre el tema claro: texto `#b4c2b6` sobre `#e4efe5` → contraste ~1,4:1 (WCAG pide 4,5:1). En la práctica, las etiquetas se ven casi borradas.
2. **Iconos vacíos.** `moods.ts` define emojis, pero el selector solo pinta el `symbol` (✦ ◒ ↗ ⌁), así que las tarjetas parecen huecas.
3. **Dos entradas que compiten.** La "⚡ Recomendación rápida" y el panel "Elige una sensación / Por emoción / Por actividad" son dos caminos del mismo peso en la misma pantalla.
4. **Fecha hardcodeada.** El saludo dice literalmente "Martes, 7 de septiembre".

## What Changes

- El inicio pasa a tener **una sola decisión principal** (emoción o actividad) y la recomendación rápida queda como **vía secundaria** subordinada.
- El selector muestra **todo el catálogo a la vez, sin paginar**, con emoji y etiqueta legibles en el tema activo.
- El inicio saluda con la **fecha actual real**.
- Se retira la cita hardcodeada del lateral (ruido y atribución dudosa).
- Todo el bloque usa **los tokens del tema** (`var(--collectify-*)`), así se ve bien en claro y en oscuro.

Fuera de alcance: migrar el resto de páginas al sistema de tokens (va en su propio change) y tocar la lógica de recomendación.

## Capabilities

### Modified Capabilities

- `recommendations`: el catálogo completo se muestra sin paginar y con emoji; el inicio ofrece un único punto de entrada principal con la rápida como vía secundaria.

## Impact

- `src/app/home/pages/StartPage.tsx`
- `src/constants/activities.ts` (emoji por actividad)
- `src/app/globals.css` (tokens que falten para el tema claro)
