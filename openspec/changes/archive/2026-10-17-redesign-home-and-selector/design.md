# Design

## Context

Ver `proposal.md` — Why. Hoy `src/app/home/pages/StartPage.tsx` (482 líneas) mezcla un panel grande de emoción/actividad, una "Recomendación rápida" con el mismo peso visual, un grid paginado de 8 en 8 con flechas propias, símbolos abstractos y colores de la paleta oscura hardcodeados. El resto de la app arrastra el mismo problema de tema (17 páginas), pero se aborda en un change aparte (`light-theme-consistency`).

## Goals / Non-Goals

**Goals:**

- Que el inicio y el selector sean legibles en el tema claro (y en el oscuro).
- Que haya una jerarquía clara: una decisión principal, una vía secundaria.
- Que el catálogo se vea entero, con iconos reconocibles.

**Non-Goals:**

- Cambiar la lógica de recomendación (`/api/getRecomendation`, filtros, historial).
- Migrar el resto de páginas al sistema de tokens.

## Decisions

### 1. Tokens del tema, no literales

Las tarjetas y textos del bloque usan `var(--collectify-*)` (`--foreground`, `--collectify-muted`, `--collectify-line`, `--collectify-mint`, `--collectify-panel`) en vez de valores oscuros fijos. El texto sobre menta usa `var(--background)`, que contrasta en ambos temas. `globals.css` define el tema claro en `.theme-light`; se añade lo que falte para superficies.

**Alternativas consideradas**

- _Migrar toda la app ahora_: convierte un arreglo de una pantalla en un barrido de 17 páginas. Descartada; va en `light-theme-consistency`.

### 2. Una decisión principal, la rápida subordinada

El panel principal es la emoción/actividad. La recomendación rápida baja a una línea de texto secundaria que despliega su formulario (formato/etiqueta). Se cumple la spec: la rápida no pide emociones.

### 3. Sin paginación

15 emociones y 9 actividades caben en un grid adaptable (`grid-cols-3 sm:grid-cols-5`). Se eliminan las flechas y el estado `selectorPage`: menos decisiones, todo a la vista.

### 4. Emoji como icono

Se usa el `emoji` ya definido en el catálogo de emociones y se añade `emoji` a `activityOptions`. Sustituyen a los símbolos geométricos, que no comunicaban nada.

### 5. Fecha real y fuera la cita

El kicker se calcula con `Intl.DateTimeFormat` sobre el idioma del documento, tras montar (evita desajuste de hidratación). Se retira el bloque de cita del lateral: era relleno y su atribución no era fiable.

## Risks / Trade-offs

- [El tema claro aún tiene tokens incompletos en otras páginas] → este change solo cubre inicio y selector; el resto se migra después.
- [Quitar la paginación alarga el panel] → el grid es adaptable y el catálogo es corto (15/9).

## Migration Plan

Sin migración de datos. Cambio de UI. Despliegue normal.

## Open Questions

- ¿Se mantiene el paso 2 (formato/etiquetas) o se colapsa en el mismo panel? v1 conserva los dos pasos por claridad.
