# Design

## Design Read

> Rediseño (**conservar** la identidad) del selector de emoción/actividad de un producto de coleccionismo musical para aficionados, con tema claro/oscuro y acento mint, apoyado en el sistema de tokens y utilidades ya existentes y con movimiento contenido.

**Diales** (sobre la base de la skill): `DESIGN_VARIANCE: 6` (es UI de producto, no una landing), `MOTION_INTENSITY: 5` (feedback táctil y transición de estado, nada de bucles), `VISUAL_DENSITY: 5` (15 + 9 opciones: denso pero respirable).

## Context

Ver `proposal.md` — Why. Hoy hay tres implementaciones de la misma idea:

- `MoodSelector` (rejilla en modo compacto + **carrusel muerto** en modo normal).
- `StartPage` (pestañas Emoción/Actividad + rejilla de 15 + paso 2 de formato/etiquetas).
- `FilterModal` (rejilla solo-emoji para filtrar la colección).

El catálogo vive en `constants/moods.ts` (15 emociones con `key`, `label`, `emoji`, `symbol`) y `constants/activities.ts` (9 actividades con `icon`, `emoji`).

## Goals / Non-Goals

**Goals:**

- Una sola forma de elegir emociones/actividades, con el mismo aspecto en inicio y en el modal.
- Que se puedan recorrer todas de un vistazo (agrupadas, sin paginar).
- Jerarquía visual clara: elegido vs. no elegido.
- Sin regresiones de datos ni de filtros.

**Non-Goals:**

- Cambiar claves o número de emociones (requiere migración de datos).
- Tocar el flujo de dos pasos (emoción → formato) más allá de lo imprescindible.

## Decisions

### 1. Se retira el carrusel

El carrusel (flechas, `onWheel`, puntos, `activeIndex`) se elimina por completo. Motivos: contradice la spec ("todas a la vez, sin paginar"), es incómodo y hoy es código muerto. La navegación pasa a ser la propia rejilla.

### 2. Agrupación en familias (sin tocar el catálogo)

Las 15 emociones se agrupan en 4 familias con etiqueta corta, definidas como metadatos en `constants/moods.ts` (las claves y los datos guardados no cambian):

| Familia | Emociones |
| --- | --- |
| Energía | energy, ecstasy, triumph, anger, challenge |
| Calma | calm, relaxation, sleep, inspiration |
| Afecto | joy, love, nostalgia |
| Melancolía | sadness, melancholy, anxiety |

`FilterModal` puede beneficiarse de la misma agrupación; como mínimo, comparte la marca visual.

### 3. Un único componente

`MoodSelector` pasa a ser el componente de elección compartido (inicio y modal), con una variante de densidad (`size`) en vez de un booleano `compact` que cambia radicalmente la estructura. La actividad usa el mismo contenedor y la misma marca, cambiando solo la fuente de opciones.

### 4. Lenguaje visual (DECISIÓN ABIERTA)

Dos direcciones, ambas con la misma estructura (rejilla agrupada, sin carrusel):

- **A — Refinar con los emoji actuales.** Tiles más limpios (menos caja, más aire), agrupados, y una selección con acento mint + relieve sutil. Coherente con el resto de la app (álbumes, filtros e historial ya usan emoji).
- **B — Pasar a marcas monocromas.** Usar los `symbol` geométricos que ya existen en los datos (✦ ◒ ↗ ⌁ …) en lugar de emoji, con el acento mint al seleccionar. Aspecto más "de diseño" y menos colorido, pero exige cambiar también el resto de pantallas para no crear incoherencia (más alcance).

### 5. Estados y accesibilidad

- Cada opción es un `button` con `aria-pressed`; el grupo, un `radiogroup`/`group` con etiqueta.
- Foco visible (no depender solo del color) y contraste AA en ambos temas.
- Feedback táctil en `:active` (`scale-[0.98]`) y transición de estado breve; todo bajo `prefers-reduced-motion`.
- Estado vacío de selección explícito ("nada todavía") y acción de limpiar.

## Risks / Trade-offs

- [Cambiar el aspecto en inicio y modal a la vez] → se hace en un único componente para que no diverjan; verificación por `tsc`, lint y build, y revisión visual del usuario (no hay navegador automatizado en este entorno).
- [Agrupar puede alargar la altura del selector] → etiquetas compactas y rejilla densa; el modal mantiene desplazamiento propio.

## Open Questions

- **A o B** para el lenguaje visual de la marca de cada emoción (ver Decisión 4).
