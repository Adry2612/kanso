# Design

## Context

Hoy el documento es el único scroller. La barra móvil es `position: sticky` dentro de ese flujo, las páginas privadas usan `min-h-screen` (100vh) y `.public-page` usa `100dvh`. En iOS, el rebote del documento desplaza la barra y descubre el fondo; además, `100vh` equivale al viewport grande, así que cuando la barra del navegador está visible sobra altura por abajo. Los campos con `text-sm` o `0.85rem` quedan por debajo de 16 px y disparan el zoom automático de iOS. Los modales usan `88vh` y bloquean el scroll con `body.style.overflow`, que Safari no respeta de forma fiable.

Restricciones que condicionan la solución:

- El layout es Next.js App Router con transiciones de vista y restauración de scroll del navegador sobre `window`.
- El panel lateral y los modales ya usan `position: fixed` y `env(safe-area-inset-*)`; el viewport declara `viewport-fit=cover`.
- Hay 32 usos de `min-h-screen` en páginas y 4 componentes que manipulan `body.style.overflow` con restauraciones distintas (`unset`, `""`, valor previo).
- La verificación real exige un iPhone: DevTools no simula el rebote, la barra dinámica ni el teclado de iOS.

## Goals / Non-Goals

**Goals:**

- Un único scroller móvil que no sea el documento, con la barra superior fuera de él.
- Altura basada en el viewport dinámico y páginas que no reserven la barra del navegador.
- Cero zoom automático al enfocar campos, sin quitar el zoom manual.
- Modales que se ajusten al viewport visible y a un teclado abierto.
- Escritorio exactamente igual que hoy.

**Non-Goals:**

- Cambiar la estructura visual, el diseño del panel o la jerarquía de los modales.
- Implementar bottom sheets o un teclado flotante propio.
- Desactivar `user-scalable` o `maximum-scale`; el zoom de accesibilidad se conserva.
- Reescribir la navegación ni las transiciones de vista.
- Cubrir navegadores sin `dvh`, `overscroll-behavior` o `visualViewport` más allá de un fallback razonable (iOS 16+ / Chrome actual).

## Decisions

### 1. Marco de scroll móvil con el cuerpo como contenedor fijo

Por debajo de 1024 px, `html` y `body` ocupan la altura visible y `body` deja de desbordar (`overflow: hidden`). `body` pasa a ser una columna flex: la barra superior es un elemento fijo del marco y `.app-content` es la única región con `overflow-y: auto`, `overscroll-behavior-y: none` y `-webkit-overflow-scrolling: touch`.

Consecuencias:

- La barra no se mueve al hacer scroll porque no está dentro del scroller.
- El rebote no puede descubrir el fondo por encima de la barra: el documento no tiene scroll.
- `.app-content` es el scroller tanto en páginas privadas como públicas (la barra simplemente no existe en las públicas).
- El cajón y los modales siguen siendo `fixed`, fuera del scroller.

Alternativa descartada: mantener el scroll del documento y confiar solo en `overscroll-behavior: none` y una barra más opaca. Es más barato, pero Safari sigue pudiendo rebotar el documento y el problema reaparece en cuanto cambia la versión o el gesto.

### 2. La barra móvil deja de ser sticky

Dentro del marco, la barra es un hijo flex de altura natural (`position: relative`, `z-index` sobre el contenido) y mantiene su `env(safe-area-inset-top)`. Se conserva el desenfoque, pero el fondo sube a ~96 % de opacidad: el contenido pasa por debajo sin que la barra parezca transparente ni se confunda con el fondo en movimiento.

El cajón se dimensiona con `height: 100dvh` en lugar de `inset-y-0` y gana scroll propio (`overflow-y: auto`, `overscroll-behavior: contain`) para pantallas muy bajas o con teclado.

### 3. Alturas dinámicas y mínimos de página

El marco usa `height: 100dvh` con fallback `100vh`. Las páginas dejan de aportar su `100vh`: en móvil, una regla acotada a `.app-content` neutraliza `min-h-screen` (`min-height: 100%`) y `.public-page` pasa a `min-height: 100%` dentro del scroller. Así una pantalla corta llena el área visible sin crear scroll, y una larga crece de forma natural.

El área segura inferior se centraliza en `.app-content` (`padding-bottom: env(safe-area-inset-bottom)`) en lugar de sumarla en cada `main`, evitando el doble relleno actual. La barra, el cajón, los avisos y los modales conservan sus propios `env()`.

### 4. Reset del scroll al cambiar de ruta

Como `window` deja de ser el scroller, la restauración nativa ya no coloca la nueva pantalla arriba. Un componente cliente montado en el layout (`MobileViewport`) escucha `usePathname` y lleva `.app-content` a `top: 0` con un `scrollTo` sin animación en un `useLayoutEffect`, antes de que se pinte la vista nueva. En escritorio no hace nada.

No se intenta replicar la restauración de scroll hacia atrás en móvil: la especificación pide que una sección nueva empiece arriba y el beneficio no compensa guardar posiciones por entrada del historial.

### 5. Campos de al menos 16 px en pantallas estrechas

Una regla global dentro de `@media (max-width: 1023px)` fija `font-size: max(16px, 1em)` para `input`, `textarea`, `select` y `[contenteditable="true"]`. Se usa `!important` de forma deliberada y acotada a móvil: las utilidades `.text-sm` y clases como `.feelings-carousel__input` compiten en especificidad y el umbral debe cumplirse en todos los campos, incluidos los futuros. `max(16px, 1em)` conserva los campos que ya fueran mayores.

No se usa `maximum-scale=1`: resolvería el zoom a costa de impedir el zoom manual. El zoom de pellizco sigue intacto.

### 6. Modales contra el viewport visible

- `.modal-shell-overlay` pasa a medirse con `height: var(--visual-viewport-height, 100dvh)` y `top: var(--visual-viewport-top, 0)`, manteniendo el padding de áreas seguras.
- `.modal-shell-panel` cambia `88vh` por un porcentaje del overlay (`min(88%, 46rem)`), de modo que al encogerse el viewport visible el panel encoge y su cuerpo sigue desplazándose.
- `MobileViewport` publica `--visual-viewport-height` y `--visual-viewport-top` desde `window.visualViewport` en `resize` y `scroll`, con `requestAnimationFrame`. Solo aplica cuando `visualViewport.scale === 1` para no reaccionar al zoom manual; sin soporte, las variables no existen y queda el fallback `100dvh`.

### 7. Bloqueo de scroll compartido

Se sustituyen los cuatro bloqueos manuales por un hook con contador (`useScrollLock`) que:

- Añade una clase al documento en lugar de escribir estilos sueltos.
- En móvil bloquea `.app-content`; en escritorio bloquea `body`.
- Guarda el estado previo y solo lo restaura cuando el último consumidor se cierra, evitando que un modal que se cierra libere el scroll de otro que sigue abierto.
- Compensa el ancho de la barra de scroll en escritorio para que el layout no salte.

`Header` (cajón), `BaseModal`, `SelectedAlbumModal` y `FriendShareModal` pasan a usarlo.

### 8. Verificación en dispositivo

La validación funcional se hace en un iPhone físico con Safari y Chrome, y en Chrome Android si está disponible: scroll arriba/abajo en Inicio, Búsqueda, Amigos y Ajustes; barra de Safari visible y oculta; teclado en la búsqueda principal, en el login y en los buscadores de un modal; rotación a horizontal. DevTools se usa solo para comprobar que escritorio y 1024 px no cambian.

## Risks / Trade-offs

- **El scroll interno rompe la restauración nativa y los anclajes** → reset explícito en cada ruta; no hay enlaces `#` en la app, y el cajón ya se cierra al navegar. Verificar que volver atrás deja la pantalla arriba y no a mitad.
- **`100dvh` y `visualViewport` no se comportan igual en todos los navegadores** → fallbacks CSS (`100vh`, `100dvh`) y ausencia de variables; la verificación incluye Safari y Chrome iOS.
- **`font-size !important` global puede sorprender a quien añada un campo** → queda documentado junto a la regla y acotado a menos de 1024 px; los campos grandes no se reducen.
- **El hook de viewport puede provocar saltos al abrir/cerrar el teclado** → se actualiza con `requestAnimationFrame`, sin transición de altura, y solo con escala 1.
- **Bloquear `.app-content` en móvil y `body` en escritorio añade dos rutas de bloqueo** → un único hook con contador y una prueba específica de dos modales superpuestos.
- **Regresión en escritorio por reglas globales** → todas las reglas nuevas viven en `@media (max-width: 1023px)` salvo los cambios de modal, que usan unidades dinámicas con fallback y se revisan a 1024 px.
