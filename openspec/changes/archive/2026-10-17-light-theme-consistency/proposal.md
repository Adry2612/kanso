# Proposal

## Why

El proyecto define un tema claro y otro oscuro con tokens (`var(--collectify-*)`, `var(--surface-*)`), `layout.tsx` aplica `theme-light` por defecto y la landing pública ya está construida con esos tokens. Pero ~23 pantallas y componentes siguen usando colores de la paleta oscura escritos a mano (`text-white`, `text-[#8f9f93]`, `bg-[#09140d]/25`…). En tema claro eso deja texto claro sobre fondo claro: contraste de ~1,4:1 frente a los 4,5:1 que pide WCAG.

La spec `appearance-settings` dice que el tema se aplica "a toda la interfaz" y que el tema por defecto es el claro; hoy eso no se cumple en la mayoría de pantallas.

## What Changes

- Migrar los colores fijos de las pantallas y componentes **vivos** a los tokens del tema, siguiendo un mapa de equivalencias.
- Completar el juego de tokens del tema claro (superficies, línea fuerte, color de error).
- Dejar **fuera** las rutas y componentes muertos (`/home/mood`, `/home/activity`, `/home/recommendation*`, `/recomendation`, `GridSelector`, `LanguageSwitcher`): se eliminan en `remove-dead-code-and-fix-lint`, no se migran.

## Capabilities

### Modified Capabilities

- `appearance-settings`: el tema elegido se aplica de verdad a toda la interfaz, sacando los colores de los tokens y manteniendo el contraste legible en claro y en oscuro.

## Impact

- ~23 ficheros vivos de `src/app` y `src/components`.
- `src/app/globals.css` (tokens del tema claro).
- Sin cambios de datos ni de API.
