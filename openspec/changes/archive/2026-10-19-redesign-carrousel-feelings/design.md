# Design

## Design Read

> Rediseño (**conservar** la identidad) de la elección de emoción/actividad en el inicio de una app de coleccionismo musical para aficionados, con tema claro/oscuro, acento mint y un sistema de tokens ya existente, apoyado en las primitivas de movimiento del repo y con movimiento contenido.

**Diales:** `DESIGN_VARIANCE: 6` · `MOTION_INTENSITY: 5` · `VISUAL_DENSITY: 5`.

## Context

Ver `proposal.md` — Why. Punto de partida y restricciones que condicionan el enfoque:

- `src/app/home/pages/StartPage.tsx` resuelve hoy la elección con un `tablist` Emoción/Actividad, una rejilla `grid-cols-3 sm:grid-cols-5` y un paso 2 de formato/etiquetas que navega a `/recommendation`.
- `src/components/MoodSelector.tsx` contiene un carrusel real (flechas, `onWheel`, puntos, `activeIndex`) que **solo se usa en modo compacto**; su rama no compacta es código muerto.
- El catálogo vive en `constants/moods.ts` (15 emociones con `key`, `label`, `emoji`, `symbol`) y `constants/activities.ts` (9 actividades con `icon`, `emoji`). La UI de inicio pinta el **emoji**; `FilterModal` y `MoodSelector` pintan el **`symbol`**.
- Sistema de diseño disponible: tokens en `globals.css` (`--surface-*`, `--collectify-mint`, `--radius-*`, `--shadow-*`, `--ease-*`), utilidades `.surface-raised`, `.glass-panel`, `.eyebrow`, y primitivas de movimiento en `src/components/motion/index.tsx` (`Reveal`, `Stagger`, `StaggerItem`, `useReducedMotion`). Foco visible y `prefers-reduced-motion` ya están resueltos a nivel global.
- Trabajo previo **rechazado** en `redesign-mood-picker` (commit `08fb61b`): pastillas + rótulos de familia. Feedback: las cajas y el emoji con protagonismo funcionaban; estorbaban las etiquetas de familia, crecer en alto y quedar "soso". Este diseño parte de ahí.

## Goals / Non-Goals

**Goals:**

- Convertir la elección de emoción/actividad en un carrusel interactivo que sea, además, plenamente accesible.
- Una **marca única** (medallón) para cada emoción y actividad, idéntica en inicio, filtro y modal.
- Que ninguna opción del catálogo quede inalcanzable por puntero ni por teclado.
- Más carácter visual que la rejilla actual, sin crecer en altura.

**Non-Goals:**

- Cambiar claves o número del catálogo (requiere migración de datos).
- Tocar la lógica de recomendación ni el historial.
- Sustituir el paso de formato/etiquetas por un rediseño mayor.

## Decisions

### 1. Patrón de interacción: carril con foco central (scroll-snap)

El carrusel es **un carril horizontal con todas las opciones renderizadas** (`overflow-x: auto` + `scroll-snap-type`), donde la opción activa se centra y crece, y los vecinos asoman a los lados. `scrollIntoView` mantiene la opción enfocada visible.

- **Por qué:** renderizar todo el catálogo (15 + 9) mantiene la promesa de la spec —todas alcanzables— y aprovecha el scroll nativo (táctil, rueda, trackpad) sin virtualizar ni paginar. Es el patrón de carrusel más accesible y con menos JavaScript.
- **Alternativa descartada — coverflow de 3 en 3** (el que ya existe en `MoodSelector`): oculta el resto de opciones, obliga a "páginas" y fue justo lo que la spec señalaba como problema. También se descartó una **rejilla** porque el objetivo es el carrusel.

### 2. Marca: medallón con el emoji del catálogo

Cada opción se pinta como **medallón**: círculo/rounded con el emoji del catálogo, tamaño grande, sobre un material derivado de los tokens (`--surface-*` + borde `--collectify-line`), con etiqueta debajo. Al seleccionar, el medallón adquiere acento mint + realce.

- **Por qué:** el emoji mantiene la coherencia con el resto de la app (que ya usa emoji en álbumes, historial y filtros) y el contenedor unificado absorbe la diferencia de render entre sistemas operativos. Da protagonismo al emoji y carácter al conjunto sin depender de ilustraciones.
- **Alternativas descartadas:** emoji "desnudo" sin contenedor (render inconsistente entre macOS/Windows/Android, opción 3 del usuario) y los `symbol` geométricos monocromos (más alcance: obligaría a homogeneizar más pantallas). El usuario eligió el medallón.
- **Reutilización:** el medallón se expone como pieza compartida para que `FilterModal` y `SaveAlbumModal` dejen de pintar el `symbol` y muestren la misma marca.

### 3. Conmutador Emoción/Actividad

Se conserva un conmutador segmentado (Emoción/Actividad) que **solo cambia la fuente de opciones** del mismo carrusel, no la estructura. Es la "única decisión principal" que pide la spec, con la recomendación rápida como vía secundaria (ya existente).

### 4. Selección

- **Emociones:** multiselección (la spec permite "una o más"), con `aria-pressed`.
- **Actividades:** selección única (la spec habla de "la actividad elegida"), con estado `aria-checked`.
- El carrusel **no infiere** la recomendación al mover el foco: se confirma con el mismo paso de formato/etiquetas que ya existe.

### 5. Accesibilidad (requisito de primera clase)

- Carril con `role="listbox"`/`role="radiogroup"` según el modo y nombre accesible; cada opción con su `aria-*` correcto.
- Teclado: flechas para moverse, Inicio/Fin para extremos, Espacio/Enter para seleccionar. El foco visible ya lo provee el sistema global (`:focus-visible`).
- Objetivos táctiles ≥ 44 px; contraste AA en ambos temas usando los tokens (no colores fijos).
- **Sin rotación automática** y animación gated por `prefers-reduced-motion` mediante `useReducedMotion` / `motion`.
- Estados completo ciclo: seleccionado / no seleccionado / foco / deshabilitado (confirmar sin selección).

### 6. Movimiento

Entrada escalonada con `Stagger`/`StaggerItem`; énfasis del foco central con `transform`/`opacity` (nunca `width`/`left`); feedback táctil en `:active`. Todo se degrada a estático con movimiento reducido.

### 6.b Colocación de controles y buscador (revisión visual 2)

- Las **flechas van centradas bajo el carril**, no a los lados: en los laterales tapaban las opciones de los extremos y el carril queda más limpio.
- Las **etiquetas reservan dos líneas** y se recortan a dos (`-webkit-line-clamp`), de modo que un nombre largo ("Haciendo ejercicio") no desalinea su medallón respecto al de un nombre corto.
- El **buscador es controlado** (`search.open` / `search.onOpenChange`). La lupa vive en la fila del conmutador Emoción/Actividad, porque ahí es donde se elige qué catálogo se filtra; el carrusel solo pinta el campo y su estado vacío. El campo se renderiza siempre y se oculta con `hidden` para que `aria-controls` no apunte a un nodo inexistente.
- La **recomendación rápida** es una vía alternativa: su disparador se sienta junto al título y el panel se despliega inmediatamente debajo de la cabecera, de manera que el resultado de pulsar quede a la vista (antes vivía en una sección aparte al final del panel). Solo está en el paso de elección, no en el de formato/etiquetas.

### 7. Se retira el carrusel muerto

`MoodSelector` deja de tener la rama no compacta con flechas/rueda/puntos; o bien se reescribe como el carrusel nuevo compartido, o se elimina en favor de un componente nuevo. La decisión concreta de nombre/ubicación se toma en implementación; el contrato es que **no quede paginación** y que la marca sea compartida.

## Risks / Trade-offs

- [Un carril oculta opciones fuera de pantalla] → snap + vecinos visibles + flechas + teclado + Inicio/Fin; escenarios de spec que exigen que **todas** sean alcanzables.
- [El emoji se renderiza distinto según el sistema] → el medallón fija tamaño, forma y fondo; se define una pila de fuentes con emoji y un fallback si falta el glifo.
- [Solape con el change pausado `redesign-mood-picker`] → este change define el propósito del selector; conviene cerrar/archivar el pausado o absorber su feedback aquí para no dejar dos planes vivos del mismo componente.
- [Crecer en alto y volver a "soso"] → el carril tiene altura acotada; el carácter viene del medallón, el énfasis central y el material, no de ocupar más.
- [Sin navegador automatizado en este entorno] → verificación por `tsc`, lint y build, más revisión visual del usuario (la vuelta anterior se rechazó justo aquí; hay que reservar esa revisión).

## Open Questions

- Ninguna que cambie specs, enfoque o tareas. El nombre y la ubicación exactos del componente compartido y la decisión de reescribir `MoodSelector` frente a crear uno nuevo se resuelven en implementación sin alterar el contrato.

## Feedback a no repetir (vuelta 1 de `redesign-mood-picker`)

- No añadir rótulos de familia ni agrupaciones que alarguen el bloque.
- Mantener el emoji con protagonismo y las **cajas** de opción, no pastillas sueltas.
- No crecer en altura respecto a la rejilla anterior.
- No dejarlo plano: el carácter es un requisito, no un extra.
