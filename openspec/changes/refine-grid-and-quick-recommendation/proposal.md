# Proposal

## Why

Al revisar `polish-ultrawide-mobile-and-collection` quedaron tres asperezas visibles: la rejilla ganó columnas por breakpoint y encogió las tarjetas de colección e histórico; en pantallas anchas sigue habiendo franjas laterales grandes; y el resultado de la recomendación rápida no muestra el formato ni la etiqueta con los que se pidió. Este cambio corrige el tamaño de las tarjetas, ensancha el contenido de forma controlada y hace visible el filtro de la recomendación rápida.

## What Changes

- **Tarjetas de álbum con tamaño estable.** Las rejillas de colección e histórico dejan de añadir columnas por breakpoint y pasan a columnas automáticas con un ancho objetivo de 300–320 px desde 768 px; en móvil se mantienen dos columnas. Las tarjetas recuperan el tamaño anterior y no se encogen al ensanchar la ventana.
- **Contenido más ancho en pantallas grandes.** El ancho máximo de `.kanso-main` sube por tramos hasta 2400 px, manteniendo los gutters actuales y los `max-w` de los bloques de texto, de modo que la cuadrícula llene el espacio disponible en lugar de dejar franjas laterales.
- **Filtros visibles al inicio de la recomendación rápida.** El resultado muestra, antes de la portada y el título, el formato y la etiqueta con los que se pidió la recomendación; si no se eligió formato, se indica «Cualquier formato». Solo aparece en la vía rápida, no en las recomendaciones por emoción o actividad.
- **Coordinación con los cambios abiertos.** La rejilla y el ancho se apoyan en `polish-ultrawide-mobile-and-collection` (que define `adaptive-layout`) y en `collection-experience`; este cambio se archiva después de ambos.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `album-collection`: la cuadrícula de la colección mantiene un ancho de tarjeta estable y reparte las columnas según el espacio, sin encoger las tarjetas en pantallas anchas.
- `recommendations`: la cuadrícula del historial usa el mismo tamaño de tarjeta estable que la colección.
- `quick-recommendation`: el resultado de la recomendación rápida muestra al principio los filtros aplicados (formato y etiquetas).

## Impact

- **Layout global:** `src/app/globals.css` (`--page-max` por tramos).
- **Colección e historial:** `src/app/collection/page.tsx`, `src/app/recomendationHistory/page.tsx` y `src/components/gallery/GallerySkeleton.tsx`.
- **Recomendación rápida:** `src/app/home/pages/RecomendationPage.tsx`, con reutilización de las etiquetas de formato y categoría ya existentes en `src/locales/es.json` y `en.json`.
- **Sin cambios** en API, Firestore, algoritmo de recomendación ni dependencias.

## Fuera de alcance

- Rediseñar las rejillas de búsqueda, artistas o novedades; conservan sus breakpoints actuales y solo se benefician del contenedor más ancho.
- Cambiar el algoritmo de recomendación o añadir filtros nuevos a la recomendación rápida.
- Reorganizar la ficha del álbum o la tracklist.
