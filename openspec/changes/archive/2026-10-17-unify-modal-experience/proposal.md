# Proposal

## Why

La app tiene hoy dos lenguajes visuales de modal que no comparten nada:

- `BaseModal` (Ordenar, Filtrar): `surface-raised`, radio `--radius-lg`, cabecera con eyebrow + título en `display`, botón de cierre con `IoClose`.
- Modales de álbum (`SaveAlbumModal`, `SuccessAlbumModal`, `AlbumAlreadyFavoriteStep`): `.album-action-modal` con radio 24px, hero con fondo de artista y portada flotante, botones `album-action-modal-*`.

El resultado es incoherente: distintos radios, superficies, cabeceras, botones de cierre y jerarquías de acción según el modal. La persona ha pedido que las modales tengan coherencia visual entre ellas.

## What Changes

- Introducir un shell de modal único (con variante "hero" opcional) construido sobre los tokens existentes y migrar a él todos los modales: Ordenar, Filtrar y los pasos de álbum (guardar/editar, éxito, ya favorito).
- Unificar escala de radios, superficie/material, tipografía de título, botón de cierre y tratamiento de acciones (primaria, secundaria, peligro) en todos los modales.
- Mantener la identidad actual (verde bosque + menta) y el comportamiento funcional de cada modal.

Fuera de alcance: accesibilidad de modales (Escape, focus trap, roles) — se aborda en el change de accesibilidad; y cambios en la lógica de ordenar/filtrar/guardar.

## Capabilities

### New Capabilities

- `modal-experience`: define el shell visual compartido y la jerarquía de acciones consistente de todos los modales de la aplicación.

### Modified Capabilities

- Ninguna (no cambia el comportamiento funcional de los modales).

## Impact

- Nuevo componente de shell de modal y, si aplica, subcomponentes de cabecera/hero/acciones.
- `src/components/BaseModal.tsx`, `src/components/SortModal.tsx`, `src/components/FilterModal.tsx`
- `src/app/search/components/SelectedAlbumModal/**` y `src/app/albums/[albumId]/page.tsx` (uso del modal)
- `src/app/globals.css` (consolidación de las clases `.album-action-modal-*` / `.save-album-modal-*` hacia el shell)
- Sin cambios de API ni de datos. Sin nuevas dependencias.
