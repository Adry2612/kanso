# Proposal

## Why

La aplicación funciona y su identidad (verde bosque + menta, estilo Spotify) gusta, pero se percibe plana: los cambios de ruta son instantáneos y sin relación espacial entre vistas, las tarjetas y botones apenas responden al puntero y las superficies tienen poca jerarquía visual. Falta la sensación de profundidad y de "producto premium" que haga que navegar la colección se sienta fluido y cuidado, sin perder la estética actual.

## What Changes

- **Sistema de movimiento y transiciones de vista**: transición entre rutas mediante la View Transitions API (con el paquete `next-view-transitions`), aparición animada y escalonada del contenido, y retroalimentación táctil en elementos interactivos.
- **Profundidad de superficies**: nueva jerarquía de materiales (superficies por capas, sombras teñidas, bordes con brillo interior, grano sutil) y escala de radios consistente.
- **Protagonismo de la portada**: color/atmósfera que se adapta al álbum y transición compartida de la portada entre tarjeta y detalle.
- **Tipografía y detalle premium**: escala display más expresiva, tracking refinado y estados completos (carga, vacío, error) cuidados.
- **Accesibilidad del movimiento**: todo el movimiento se desactiva con `prefers-reduced-motion`.

## Capabilities

### New Capabilities

- `motion-and-transitions`: define el comportamiento observable de animaciones y transiciones de navegación (transiciones entre vistas, aparición de contenido, retroalimentación interactiva y respeto por movimiento reducido).

### Modified Capabilities

- Ninguna. El rediseño es de presentación y movimiento; no cambia requisitos funcionales existentes.

## Impact

- `src/app/globals.css` (tokens, superficies, tipografía, CSS de View Transitions, movimiento)
- `src/app/layout.tsx` (proveedor de transiciones y configuración de movimiento)
- Nuevos componentes de movimiento (`src/components/motion/`)
- `src/components/Header.tsx`, `src/components/AlbumCard.tsx`, `src/components/BaseModal.tsx`
- Pantallas: `src/app/page.tsx`, `src/app/home/pages/StartPage.tsx`, `src/app/favorites/page.tsx`, `src/app/search/page.tsx`, `src/app/albums/[albumId]/page.tsx`, `src/app/settings/page.tsx`, `src/app/recomendationHistory/page.tsx`, `src/app/home/{mood,activity,recommendation,recommendation-result}/page.tsx`
- Modales y estados: `src/app/search/components/SelectedAlbumModal/**`, `src/components/{BaseModal,SortModal,Skeleton}.tsx`
- Nueva dependencia: `next-view-transitions`
