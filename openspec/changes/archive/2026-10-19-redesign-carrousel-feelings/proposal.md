# Proposal

## Why

Hoy la emoción se elige en una rejilla plana de 15 cajas con dos pestañas: funciona, pero es un trámite sin carácter y no invita a "sentir" antes de decidir. Además, el único carrusel que existe (`MoodSelector`) está muerto —solo se usa su modo compacto— y encima contradice la spec vigente porque pagina. Queremos que elegir cómo te sientes (o qué estás haciendo) sea el momento central de la app: un carrusel interactivo que, con la emoción o la actividad elegida, recomiende el disco.

## What Changes

- **Carrusel interactivo de emociones y actividades** como decisión principal del inicio: arrastre, flechas, rueda y teclado; foco central con vecinos visibles.
- **Medallón unificado** como marca de cada emoción y actividad: el emoji del catálogo dentro de un contenedor consistente con los tokens del tema, con protagonismo y la misma marca en el inicio, el filtro y el modal.
- Con la emoción o actividad elegida, el carrusel **recomienda el disco** (se conserva el paso de formato/etiquetas y la navegación al resultado).
- **Accesibilidad y movimiento**: navegación por teclado (flechas, Inicio/Fin), `aria-*` y nombre accesible correctos, foco visible, contraste AA en ambos temas, objetivos táctiles ≥ 44 px, **sin auto-rotación** y todo bajo `prefers-reduced-motion`.
- **BREAKING (spec)**: la spec `recommendations` exige hoy mostrar el catálogo "sin paginar"; pasa a permitir la presentación en un carrusel accesible que mantiene navegables todas las opciones.
- **Retirar el carrusel muerto** de `MoodSelector` (flechas, rueda y puntos con paginación) en favor del componente compartido nuevo.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `recommendations`: la presentación del catálogo de emociones y actividades en el inicio cambia de una rejilla con pestañas y pasos a un carrusel interactivo accesible, con una marca unificada (medallón) por emoción y actividad y con teclado como vía de navegación equivalente al puntero.

## Impact

- `src/app/home/pages/StartPage.tsx` — el carrusel pasa a ser la decisión principal (sustituye pestañas + rejilla + paginación).
- `src/components/MoodSelector.tsx` — se reescribe como carrusel compartido de emociones y actividades, o se sustituye por un componente nuevo.
- `src/components/FilterModal.tsx` y `src/app/search/components/SelectedAlbumModal/steps/SaveAlbumModal.tsx` — comparten la marca del medallón para no divergir.
- `src/constants/moods.ts` y `src/constants/activities.ts` — sin cambios de claves; solo metadato de marca si hace falta.
- `src/locales/es.json` y `src/locales/en.json` — textos del carrusel (título, ayuda, posición).
- `src/app/globals.css` — marca del medallón y utilidades del carrusel, reutilizando los tokens existentes.
- Relación con el change pausado `redesign-mood-picker`: comparte zona del código; este change define el propósito del selector y conviene resolverlos juntos o cerrar el pausado.

## Fuera de alcance

- Cambiar las **claves** del catálogo de emociones/actividades o su número (los datos guardados y `FilterModal` las usan; requeriría migración).
- Tocar la **lógica de recomendación** (puntuación por actividad, historial, filtros de formato/etiquetas).
- Migrar el resto de páginas al sistema de tokens.
