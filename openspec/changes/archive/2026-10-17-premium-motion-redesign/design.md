# Design

## Context

Ver `proposal.md`. La app usa Next.js 15.4 (App Router), React 19.1, Tailwind v4, `framer-motion` 12 y tokens CSS propios en `globals.css` (verde bosque + menta). El rediseño conserva la identidad y añade profundidad y movimiento.

## Goals / Non-Goals

**Goals**

- Jerarquía de superficies y tipografía con sensación premium.
- Movimiento motivado: guiar la atención, dar continuidad espacial y confirmar acciones.
- Transiciones entre rutas con relación espacial entre vistas.

**Non-Goals**

- Cambiar la paleta, la estructura de navegación o los flujos funcionales.
- Sustituir Tailwind por otra librería de estilos.
- Rehacer el contenido/copy más allá de ajustes puntuales.

## Decisions

### 1. View Transitions vía `next-view-transitions`

React 19.1 no incluye el runtime de `<ViewTransition>` (llega en 19.2), así que la opción soportada por Next (`experimental.viewTransition`) no está disponible sin subir React. Usamos `next-view-transitions`: envuelve la navegación del App Router en la View Transitions API nativa y aporta `ViewTransitions`, `Link` y `useTransitionRouter`.

**Alternativas consideradas**

- _Subir React a 19.2_: mayor riesgo de regresiones en toda la app para una feature de presentación.
- _`document.startViewTransition` manual_: no resuelve bien la actualización asíncrona del App Router.

### 2. Movimiento con `framer-motion` (ya instalado)

Se crean primitivas reutilizables (`Reveal`, `Stagger`, `StaggerItem`) en un único módulo cliente, en lugar de dispersar animaciones por cada pantalla. `framer-motion` ya está en `package.json`; no se añade dependencia nueva.

### 3. Radios y materiales con una escala lock

Se fija una escala de radios (`--radius-xs/sm/md/lg/pill`) y una jerarquía de superficies (`--surface-1/2/3`) para evitar el aspecto "cada componente a su aire". Las sombras se tiñen al fondo (verde), nunca negro puro.

### 4. Continuidad de la portada

`view-transition-name` por álbum (`album-cover-<id>`) en la tarjeta y en el detalle para producir el morph de portada. Los nombres son únicos por álbum para no colisionar con múltiples tarjetas visibles.

### 5. Movimiento reducido

Toda animación se condiciona a `prefers-reduced-motion: no-preference` (CSS) y a `useReducedMotion()` (Motion). El estado por defecto degrada a estático.

## Risks / Trade-offs

- [Colisión de `view-transition-name` con varias tarjetas] → nombre único por álbum; el detalle reutiliza el mismo nombre.
- [Animaciones que afectan INP en listas largas] → amortiguar con `whileInView` y `once: true`; animar solo `transform`/`opacity`.
- [`next-view-transitions` con React 19] → es la librería estándar para App Router; se valida compilando y navegando en las pantallas clave.
- [Hidratación con animaciones] → primitivas con `'use client'` y valores iniciales compatibles con SSR.

## Migration Plan

Sin migración de datos. Despliegue normal. Si algún efecto degrada el rendimiento en producción, se puede desactivar por pantalla sin tocar los tokens.
