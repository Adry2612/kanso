# Design

## Context

Ver `proposal.md` — Why. Lighthouse (desktop) da 95–96 en Accesibilidad por dos fallos: `color-contrast` y `label-content-name-mismatch`. Todos los nodos de contraste salen del mismo token: `--collectify-mint` en tema claro (`#368b52`). El nombre accesible incoherente está en el botón de perfil de `Header.tsx`. El foco `:focus-visible` global ya está definido en `globals.css`.

## Goals / Non-Goals

**Goals:**

- Cerrar los fallos de Lighthouse sin tocar estructura ni copia.
- Dejar un contrato de accesibilidad verificable.

**Non-Goals:**

- Rediseñar pantallas.
- Auditar con lector de pantalla real (queda como verificación manual aparte).
- La descripción SEO.

## Decisions

### 1. Oscurecer el acento del tema claro

Se cambia `--collectify-mint` del tema claro de `#368b52` a `#2c7a45`. Medido: **5.28:1** como texto sobre blanco y **4.79:1** con el texto claro del tema encima. Cumple AA en los dos usos y sigue siendo el mismo verde. El tema oscuro no se toca (ya cumple).

**Alternativas consideradas**

- _Cambiar el color del texto sobre el acento en cada botón_: toca decenas de sitios y no arregla el acento como texto. Descartada.
- _Bajar a texto grande donde falla_: cambia tipografías por una razón de color. Descartada.

### 2. Nombre accesible = texto visible

En el botón de perfil se quita el `aria-label` que no coincidía y se marca el avatar como decorativo (`aria-hidden`). Así el nombre accesible del botón pasa a ser su propio texto visible, y no hay contradicción.

### 3. Foco visible (ya existente)

`globals.css` ya define `:focus-visible` con contorno de 2px y `outline-offset`. Se documenta como requisito y se verifica que sigue presente; no hace falta cambiarlo.

## Risks / Trade-offs

- [Oscurecer el acento afecta a toda la interfaz clara, incluida la landing] → es una mejora de contraste en ambos sitios; se revisa visualmente.
- [El nombre del botón incluirá el correo o "Tu perfil"] → es exactamente su texto visible, que es lo que pide la regla.

## Migration Plan

Sin migración. Cambio de token y de un atributo. Despliegue normal.

## Open Questions

- ¿Añadir la `meta description` que pide Lighthouse? Fuera de alcance; se decide aparte.
