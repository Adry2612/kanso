# Design

## Context

Ver `proposal.md` — Why. `AlbumCard` recibe hoy una prop opcional `tags` y renderiza `TagList`. Su único consumidor que pasa `tags` es `src/app/favorites/page.tsx` (`tags={favorite.tags || []}`); `src/app/search/page.tsx` no la pasa. `TagList` también se usa directamente en el detalle del álbum (`src/app/albums/[albumId]/page.tsx`), que no se toca.

## Goals / Non-Goals

**Goals:**

- Que las tarjetas de la colección no muestren etiquetas.
- Dejar una sola forma predecible de renderizar una tarjeta de álbum en la rejilla.

**Non-Goals:**

- Tocar el filtrado por etiquetas ni su UI.
- Cambiar los datos guardados.

## Decisions

### 1. Retirar la prop `tags` de `AlbumCard` en vez de dejar de pasarla

Se elimina la prop `tags` (y el import de `TagList`) de `AlbumCard`, porque su único uso era la colección y mantener una prop que siempre llega vacía invita a reintroducir etiquetas por descuido.

**Alternativas consideradas**

- _Dejar de pasar `tags` desde `favorites/page.tsx` y mantener la prop_: cambio mínimo, pero deja una prop muerta y el riesgo de que reaparezcan. Descartada.
- _Ocultar con CSS según contexto_: ocultar visualmente algo que sigue en el DOM no cumple el objetivo. Descartada.

### 2. `TagList` se conserva

Sigue usándose en el detalle del álbum, donde las etiquetas sí aportan contexto. No se elimina.

## Risks / Trade-offs

- [Algún consumidor futuro esperaba `tags` en la tarjeta] → la prop desaparece y el compilador lo señala; es intencional.
- [Pérdida de información en la colección] → las etiquetas siguen visibles en el detalle y siguen siendo filtrables.

## Migration Plan

No requiere migración. Despliegue normal.
