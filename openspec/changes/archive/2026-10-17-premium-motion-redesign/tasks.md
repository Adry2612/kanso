# Tasks

## 1. Sistema de diseño (tokens y materiales)

- [x] 1.1 Ampliar `src/app/globals.css` con escala de radios, jerarquía de superficies, sombras teñidas y borde con brillo interior; verificar que los estilos existentes siguen renderizando correctamente en `/home`
- [x] 1.2 Añadir fondo atmosférico (aurora/mesh) y capa de grano fija `pointer-events-none`; verificar que no hay repintados al hacer scroll (sin jank)
- [x] 1.3 Refinar tipografía display (escala, tracking, balance) y estados de foco `:focus-visible`; verificar contraste AA del texto y de los CTA en claro y oscuro
- [x] 1.4 Añadir CSS de View Transitions (`::view-transition-old/new`) con tiempos y curvas, bajo `prefers-reduced-motion: no-preference`; verificar que la navegación no parpadea

## 2. Primitivas de movimiento

- [x] 2.1 Crear `src/components/motion/` con `Reveal`, `Stagger` y `StaggerItem` (cliente, `framer-motion`) y verificar que respetan `useReducedMotion()`
- [x] 2.2 Documentar el uso de cada primitiva con un comentario breve y verificar el tipo de sus props

## 3. Transiciones entre vistas

- [x] 3.1 Envolver el layout con `ViewTransitions` de `next-view-transitions` y ajustar la configuración si es necesario; verificar que la app compila y navega
- [x] 3.2 Migrar la navegación del `Header` y las tarjetas a `useTransitionRouter`/`Link` de `next-view-transitions`; verificar transiciones al cambiar de sección
- [x] 3.3 Añadir `view-transition-name` único por álbum en la tarjeta y en el detalle; verificar el morph de portada desde `/search` hacia `/albums/[albumId]`

## 4. Aplicación en pantallas

- [x] 4.1 Aplicar movimiento y profundidad a `src/app/page.tsx` (nocturna pública) y verificar que el hero cabe en el primer viewport con los CTA visibles
- [x] 4.2 Aplicar entrada escalonada y retroalimentación a `src/components/AlbumCard.tsx`, `src/app/favorites/page.tsx` y `src/app/search/page.tsx`; verificar hover y pulsación
- [x] 4.3 Aplicar movimiento a `src/app/home/pages/StartPage.tsx` y `src/app/albums/[albumId]/page.tsx` (entrada del detalle y lista de pistas); verificar carga, vacío y error
- [x] 4.4 Animar `src/components/BaseModal.tsx` (entrada/salida) y verificar que el flujo de guardado sigue funcionando en `/search`
- [x] 4.5 Animar `src/app/settings/page.tsx` (toggle de tema con `layoutId`, entrada por secciones) y `src/app/recomendationHistory/page.tsx` (entradas escalonadas) y verificar su render
- [x] 4.6 Animar `SelectedAlbumModal` y `SaveAlbumModal` (entrada/salida y transición entre los tres pasos) y verificar que el modal no se renderiza nulo durante la animación de salida
- [x] 4.7 Llevar al sistema de diseño y animar `home/mood`, `home/activity`, `home/recommendation` y `home/recommendation-result` (títulos, botones y entrada) y verificar su render
- [x] 4.8 Sustituir el pulso del `Skeleton` por un shimmer y verificar los estados de carga en favoritos e historial

## 5. Verificación final

- [x] 5.1 Verificar movimiento reducido en todas las animaciones nuevas y comprobar que sin `prefers-reduced-motion` todo aparece estático
- [x] 5.2 Ejecutar `npx tsc --noEmit` y `npm run build` y verificar que no hay errores (el `next lint` del proyecto falla por un problema de formato de config de ESLint ajeno a este change)
- [x] 5.3 Ejecutar `openspec validate premium-motion-redesign` y verificar que el change es válido

## Workflow follow-up

- Archivar el change cuando el rediseño esté revisado y aprobado.
