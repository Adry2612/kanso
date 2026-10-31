# Proposal

## Why

Mientras se calcula una recomendación, la pantalla muestra un esqueleto genérico de bloques que no comunica lo que está pasando: parece que la ficha no ha cargado, no que el sistema esté eligiendo un disco. Una espera breve pero con carácter refuerza la identidad de Kanso y hace que la carga se sienta intencionada.

## What Changes

- **Animación de carga del resultado**: sustituir el bloque grande de esqueleto de la portada en la carga de la recomendación por un **cajón de vinilos** minimalista: varias fundas en fila dentro de una caja y una que se adelanta ligeramente en ciclo, como si se estuviera hojeando para escoger un disco.
- La animación se apoya en los tokens de Kanso (línea, superficie y verde menta), ocupa el mismo hueco que la portada para no provocar saltos de maquetación y mantiene el estado accesible de carga (`role="status"`, `aria-busy="true"` y texto para lectores de pantalla).
- **Movimiento reducido**: con `prefers-reduced-motion: reduce` el cajón se muestra estático, sin ciclo de fundas.
- El resto de la carga (líneas de título y artistas) conserva su esqueleto actual.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `recommendations`: el estado de carga del resultado incorpora una animación de cajón de vinilos en lugar del esqueleto de portada genérico, con degradación estática en movimiento reducido.

## Impact

- Componente nuevo: `src/components/album/VinylCrateLoader.tsx`.
- Pantalla: `src/app/home/pages/RecomendationPage.tsx` (rama de carga).
- Estilos: posible bloque en `src/app/globals.css` para el cajón y su variante de movimiento reducido.
- Reutiliza `framer-motion` y los tokens existentes; sin cambios de API, datos ni dependencias.
- No altera el contrato de recomendación, el resultado ni los estados de error o sin coincidencias.
