# Design

## Context

Ver `proposal.md` — Why. `Stagger` y `StaggerItem` (en `src/components/motion/index.tsx`) montan con `initial="hidden"` y disparan con `whileInView="show"` (`viewport: { once: true, amount: 0.12 }`). El contenido que se genera tras una acción (resultados de búsqueda) o una carga puede montarse ya en pantalla o con la pestaña oculta; entonces la intersección no se resuelve y los elementos se quedan en `opacity: 0`. En `src/app/api/search/route.ts`, `searchStuff` devuelve `res.json()` sin comprobar el estado, así que un error de Spotify viaja con HTTP 200.

## Goals / Non-Goals

**Goals:**

- Que las listas y rejillas de datos sean siempre visibles al aparecer.
- Que un error del proveedor se muestre como error, no como "sin resultados".

**Non-Goals:**

- Cambiar el revelado al hacer scroll del landing público.
- Tocar el retardo de la búsqueda o su ranking.

## Decisions

### 1. `Stagger` con entrada al montar (`onMount`)

Se añade a `Stagger` un modo `onMount` que usa `animate="show"` en lugar de `whileInView="show"`. Los `StaggerItem` siguen heredando la variante escalonada del contenedor, así que el efecto visual se conserva pero deja de depender de la intersección. Se aplica a las rejillas de datos; el landing público (`src/app/page.tsx`) mantiene `whileInView` porque su revelado al hacer scroll es intencional.

**Alternativas consideradas**

- _Quitar las animaciones de entrada_: pierde el escalonado que pide `motion-and-transitions`. Descartada.
- _Animación con retardo/observador propio_: reinventa lo que ya hace framer. Descartada.

### 2. Validar la respuesta de Spotify en `/api/search`

Tras llamar a `searchStuff`, si la respuesta no trae `albums`/`artists` (es decir, no es un resultado de búsqueda válido), el endpoint responde 502 con un mensaje de error en lugar de 200. El cliente ya distingue error de "sin resultados" porque comprueba `res.ok`.

## Risks / Trade-offs

- [Cambiar el montaje de la entrada altera el momento de la animación en listas largas] → solo afecta a rejillas de datos; el landing conserva el revelado al scroll.
- [Un cambio en la forma de la respuesta de Spotify] → el guard comprueba la presencia de `albums`/`artists`, que es el contrato de `type=album,artist`.

## Migration Plan

Sin migración. Cambio de comportamiento en el cliente y el endpoint. Despliegue normal.

## Open Questions

- Ninguna.
