# Design

## Context

Ver `proposal.md` y `specs/recommendations/spec.md` para la motivación y el contrato.

- `src/app/home/pages/RecomendationPage.tsx` resuelve la carga con un bloque de `Skeleton` que imita la ficha: un cuadrado para la portada y líneas para título, artistas y tracklist.
- `framer-motion` ya está instalado y `src/components/motion/index.tsx` expone `motion` y `useReducedMotion`; los estilos usan tokens (`--kanso-line`, `--surface-2`, `--kanso-mint`).
- La carga dura poco, así que la animación debe ser ligera, no bloquear y no provocar *layout shift* al sustituirse por la ficha.

## Goals / Non-Goals

**Goals:**

- Comunicar «estamos eligiendo un disco» con una pila de portadas en abanico.
- Mantener el hueco y la proporción de la portada para que la transición a la ficha no salte.
- Respetar `prefers-reduced-motion` y seguir anunciando la carga a lectores de pantalla.

**Non-Goals:**

- Cambiar el resultado, el flujo de recomendación ni los estados de error/sin coincidencias.
- Introducir ilustraciones, imágenes nuevas o dependencias.
- Animar el tracklist o el resto de la pantalla.

## Decisions

### 1. `VinylCrateLoader` como pila de portadas en abanico

Nuevo `src/components/album/VinylCrateLoader.tsx` (cliente) que dibuja una pila de 5 portadas cuadradas en abanico: rotaciones pequeñas alrededor de la base y un ligero desplazamiento lateral. Una portada se adelanta (sube, se endereza y escala) en ciclo y vuelve, como si se sacara de la pila para mirarla. Usa `motion.span` con keyframes y `useReducedMotion` para desactivar el ciclo. Las portadas son abstractas (gradiente y un vinilo sutil) porque durante la carga no se conocen los datos. No recibe props de negocio: solo el tamaño lo aporta el contenedor.

- **Alternativa descartada:** animar el `Skeleton` existente. Un bloque gris que se mueve no comunica «escoger un vinilo».
- **Alternativa descartada:** vídeo o SVG animado externo. Añade peso y una dependencia visual que no encaja con el resto de la interfaz.

### 2. Integración en la rama de carga

En `RecomendationPage`, la rama `!mounted || isLoading` mantiene las líneas de esqueleto para título, artistas y tracklist, y sustituye solo el cuadrado de portada por `VinylCrateLoader` dentro del mismo hueco `aspect-square`/ancho máximo. Así el resto de la malla no cambia y el paso a la ficha conserva la posición.

### 3. Accesibilidad y movimiento reducido

El contenedor de carga conserva `role="status"` y `aria-busy="true"` con el texto `sr-only` existente. El cajón es decorativo (`aria-hidden`). Con `prefers-reduced-motion: reduce` las fundas quedan en su posición base, sin ciclo.

## Risks / Trade-offs

- **La animación puede distraer en una espera muy corta** → Ciclo lento y desplazamiento pequeño; la pila se retira en cuanto llega el resultado.
- **Puede provocar saltos al sustituirse por la ficha** → Reservar el mismo `aspect-square` y ancho máximo que la portada.
- **Coste de animación en móvil** → Solo transformaciones (`translate`/`rotate`/`scale`) sobre pocos nodos y respeto de movimiento reducido.
- **Accesibilidad** → Mantener el estado de carga anunciado y marcar el dibujo como decorativo.

## Migration Plan

Sin datos ni API. Se despliega con el frontend:

1. Añadir `VinylCrateLoader`.
2. Sustituir el esqueleto de portada en la carga de la recomendación.
3. Verificar carga, movimiento reducido y salto a la ficha; rollback revirtiendo el commit.
