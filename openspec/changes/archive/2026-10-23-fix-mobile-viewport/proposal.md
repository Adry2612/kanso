# Proposal

## Why

La emulación responsive de Chrome DevTools no reproduce el comportamiento real de los navegadores móviles: el rebote del documento, la barra dinámica de Safari/Chrome y el zoom automático al enfocar un campo. En un iPhone, al hacer scroll el contenido se mueve por encima de la barra superior y deja ver el fondo; al llegar abajo aparece una franja que el layout reserva para una barra de navegador que no siempre existe; y al abrir el teclado la página se amplía y descoloca la pantalla. Son fallos visibles en todas las pantallas privadas y también en el acceso y la bienvenida.

## What Changes

- **Marco de scroll móvil.** En pantallas de menos de 1024 px el documento deja de ser el scroller: la barra superior queda fuera de una única región de contenido con scroll propio, de modo que el rebote no puede desplazar la barra ni descubrir el fondo por encima de ella. Al cambiar de ruta, esa región vuelve arriba.
- **Viewport dinámico y áreas seguras.** La altura útil sale del viewport dinámico (`dvh`) y no de `100vh`; las páginas dejan de reservar altura para barras de navegador que pueden estar ocultas y respetan el notch, el indicador de inicio y la barra inferior visible.
- **Sin zoom al enfocar campos.** Todos los campos editables de pantallas estrechas usan al menos 16 px, el umbral por debajo del cual iOS amplía la página al enfocar. El zoom manual con dos dedos sigue disponible.
- **Modales y teclado.** Los modales se dimensionan contra el viewport visible, mantienen su cuerpo desplazable y su cierre accesible cuando aparece el teclado, y el bloqueo del scroll deja de depender de `body.style.overflow`, que Safari no respeta de forma fiable.
- **Escritorio intacto.** Desde 1024 px se conserva el scroll del documento, el panel lateral fijo y el comportamiento actual.

## Capabilities

### New Capabilities

- `mobile-viewport`: comportamiento del área visible en pantallas estrechas: contención del scroll frente a la barra superior, altura dinámica, áreas seguras, estabilidad al abrir el teclado y ausencia de zoom automático en los campos.

### Modified Capabilities

Ninguna. La navegación y los modales cambian su comportamiento de viewport, no sus requisitos de estructura, accesos ni jerarquía visual.

## Impact

- `src/app/layout.tsx` — viewport y estructura del marco móvil.
- `src/app/globals.css` — scroller móvil, barra superior, alturas dinámicas, áreas seguras, tamaños de campo y modales.
- `src/components/Header.tsx` — barra fuera del scroller, cierre del cajón y reset de scroll al navegar.
- `src/components/ModalShell.tsx`, `src/components/BaseModal.tsx`, `src/app/search/components/SelectedAlbumModal/**`, `src/components/FriendShareModal.tsx` — altura visible y bloqueo de scroll compartido.
- Campos de `search`, `artists`, `friends`, `recomendationHistory`, `login`, `FeelingsCarousel` y `TagEditor`, además de las utilidades `.kanso-input` y `.public-input`.
- Páginas con `min-h-screen` y `.public-page` / `.kanso-main` — altura útil en móvil sin reservar la barra del navegador.
- Sin cambios de API, datos ni dependencias.

## Fuera de alcance

- Rediseñar la interfaz móvil o el panel lateral.
- Desactivar el zoom manual (`user-scalable=no` / `maximum-scale=1`), que perjudica la accesibilidad.
- Cambiar el comportamiento de escritorio o de las transiciones entre vistas.
- Sustituir la verificación en dispositivo físico por la emulación de DevTools.
