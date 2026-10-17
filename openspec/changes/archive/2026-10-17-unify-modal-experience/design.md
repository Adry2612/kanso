# Design

## Context

Ver `proposal.md` — Why. Hoy conviven:

- `BaseModal` (`src/components/BaseModal.tsx`): shell con `surface-raised`, `max-w-lg`, cabecera (eyebrow + `display`) y cuerpo/footer; lo usan `SortModal` y `FilterModal`.
- Modales de álbum: `.album-action-modal` / `.album-art-modal` (en `globals.css`, líneas ~498-750) con hero (`album-art-modal-hero`, portada flotante), `.album-action-modal-actions` y botones `album-action-modal-primary/secondary/danger`. Los usan `SaveAlbumModal`, `SuccessAlbumModal` y `AlbumAlreadyFavoriteStep`, orquestados por `SelectedAlbumModal`.

Ambos son theme-aware (usan variables `--collectify-*`), pero divergen en radio, cabecera, cierre y botones.

## Goals / Non-Goals

**Goals:**

- Un único shell de modal reutilizable, con variante hero opcional.
- Una única escala de radios, un único botón de cierre y una única jerarquía de acciones.
- Mantener la identidad y el comportamiento de cada modal.

**Non-Goals:**

- Cambiar lógica de ordenar/filtrar/guardar.
- Añadir accesibilidad de teclado/foco (change aparte), aunque la estructura no debe impedirla.
- Cambiar animaciones más allá de unificarlas.

## Decisions

### 1. Un shell único (`ModalShell`) con slot de hero opcional

Se crea un componente de shell con cabecera, cuerpo y acciones, y una variante hero. `BaseModal` se reconstruye sobre el shell y los modales de álbum pasan a usar el mismo shell aportando su hero (fondo de artista + portada flotante) como slot.

**Alternativas consideradas**

- _Unificar solo las clases CSS y mantener dos componentes_: reduce la coherencia y deja dos rutas de mantenimiento; la deriva vuelve. Descartada.
- _Unificar todo en `BaseModal` metiendo el hero dentro_: infla el componente base con lógica solo de álbum. Descartada; el hero vive como slot.

### 2. Regla documentada de radios

- Shell del modal: radio grande (`--radius-lg`).
- Acciones, inputs y selectores: radio medio (`--radius-md`).
- Chips/etiquetas: pill.
La regla se documenta en el propio shell y se aplica en todos los modales.

### 3. Jerarquía de acciones única

Se sustituyen las clases `album-action-modal-primary/secondary/danger` por un juego único de acciones del shell (primaria = relleno menta; secundaria = borde; destructiva = peligro) reutilizado por todos los modales. Se conserva el acento menta sobre la identidad verde existente.

### 4. Un solo botón de cierre

Mismo icono, tamaño, posición y tratamiento de hover en todos los modales (incluidos los de hero).

### 5. Un solo momento de entrada

Todos los modales comparten la misma animación de entrada (spring suave) y respetan `prefers-reduced-motion` vía el sistema `motion` existente.

## Risks / Trade-offs

- [Regresión en el asistente de guardado (scroll, max-height, pasos)] → el shell conserva `max-height` y scroll interno; se verifica cada paso y en móvil.
- [Regresión en el hero de álbum (imagen de artista, portada flotante)] → el hero se conserva como slot; se compara visualmente antes/después.
- [Contraste en tema claro] → se revisan las superficies unificadas en ambos temas.
- [Migración amplia de CSS] → se hace por partes (base primero, álbum después) con `tsc`/`build` entre pasos.

## Migration Plan

Refactor por pasos: (1) shell + clases unificadas, (2) migrar modales simples (Ordenar/Filtrar), (3) migrar modales de álbum. Sin migración de datos. Despliegue normal.
