# Proposal

## Why

Una auditoría con Lighthouse (home, búsqueda, colección y novedades) deja dos fallos reales y sistemáticos:

1. **Contraste insuficiente en el tema claro.** El verde de acento del tema claro (`#368b52`) da **4.22:1** como texto sobre blanco y **3.83:1** con texto claro encima, por debajo del 4.5:1 que pide WCAG AA. Afecta a botones como "Ordenar", "Filtrar", "Explorar discos" y la pestaña activa del selector.
2. **Nombre accesible incoherente.** El botón de perfil del lateral tiene `aria-label="Abrir perfil"`, pero su texto visible es otro; las personas con lector de pantalla oyen algo que no coincide con lo que ven. Aparece en **todas** las páginas.

## What Changes

- Oscurecer el verde de acento del tema claro para cumplir AA en los dos usos (texto sobre fondo claro y texto claro sobre el acento), sin cambiar la identidad.
- Hacer que el nombre accesible del botón de perfil coincida con su texto visible (avatar decorativo oculto a lectores).
- Añadir una capability `accessibility` con el contrato verificable de contraste, nombres accesibles y foco visible (el foco `:focus-visible` global ya existe).

## Capabilities

### Modified Capabilities

- `appearance-settings`: el tema claro mantiene contraste suficiente en sus acentos.

### New Capabilities

- `accessibility`: contraste AA, nombres accesibles coherentes y foco visible.

## Impact

- `src/app/globals.css` (token del tema claro).
- `src/components/Header.tsx` (botón de perfil).
- Sin cambios de datos ni de estructura.

## Fuera de alcance

- La descripción SEO que también señala Lighthouse (`meta description` ausente): no es accesibilidad; se puede añadir en otro momento.
