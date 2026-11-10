# Design

## Context

Ver `proposal.md` para la motivación. El estado actual relevante:

- El fondo decorativo vive en `body` con degradados radiales de tamaño fijo, mientras `.kanso-main` limita el contenido a `min(100%, 1440px)` y centra con `margin: 0 auto`. Las pantallas de álbum y recomendación pintan además un degradado absoluto dentro de ese `main`, de modo que en ultrawide el degradado termina donde termina el bloque de 1440 px.
- `.app-content` es el scroller en móvil y el contenedor de todas las páginas. `Header` oculta el panel en `/`, `/login` y `/f/*`, y `useSidebar` aplica `public-shell` al `body` para anular el margen del panel.
- `CollectionEmptyState` es un bloque `max-w-xl` sin centrado horizontal. Los badges de emoción de la colección se generan en `collection/page.tsx` sin conocer el filtro activo.
- `useHomeStart` ya pide la colección para extraer etiquetas, pero no expone si está vacía. `useRecommendation` distingue `noMatch` de error en el flujo por emoción, pero en el flujo por actividad un resultado vacío se trata como error.
- `signInWithGoogle()` usa `signInWithPopup` sin distinguir viewport. `AuthContext` restaura cualquier usuario, incluido uno anónimo, y no hay ninguna marca de entrada explícita como invitado. No existe manifiesto PWA ni metadatos de app instalable.

## Goals / Non-Goals

**Goals:**

- Que el fondo sea continuo a cualquier ancho y que el contenido crezca por tramos sin romper la legibilidad.
- Que los estados vacíos y el filtro de emoción comuniquen mejor sin cambiar los datos ni la API.
- Que la bienvenida y el acceso con Google funcionen de forma predecible en móvil.
- Que la app instalada se abra sin chrome del navegador.

**Non-Goals:**

- Ocultar la barra del navegador en una pestaña normal.
- Añadir service worker, caché offline o pantallas de instalación.
- Cambiar el algoritmo de recomendación, Firestore o los endpoints.
- Reorganizar por completo las pantallas; solo se ajustan fondo, anchos, rejillas, estados vacíos y acceso.

## Decisions

### 1. Fondo a sangre completa separado del ancho de contenido

Se mantiene `.kanso-main` como contenedor de contenido, pero el sombreado deja de vivir dentro de él:

- El sombreado de tema (radiales claro/oscuro) pasa a una capa fija de viewport (`body::before` o equivalente) con `inset: 0`, `pointer-events: none` y `z-index` negativo, usando los tokens del tema. Así no se desplaza ni se recorta al hacer scroll.
- En álbum y recomendación, el degradado derivado de la portada se mueve a un contenedor de página a ancho completo que envuelve al `main`; el `main` deja de llevar `overflow-hidden` que recortaba el degradado. El contenido sigue limitado por `.kanso-main`.
- `.public-page` deja de ser opaco para que el sombreado del viewport se vea también en la landing y el acceso.

Alternativa considerada: quitar el ancho máximo a `.kanso-main` y añadir un wrapper interno en cada página. Se descarta porque obliga a tocar todas las pantallas y duplica la responsabilidad del ancho.

### 2. Anchos por tramos y rejillas con columnas adicionales

Se introduce una variable de ancho máximo de contenido con tramos:

| Viewport | Ancho máximo |
| --- | --- |
| < 1600 px | 1440 px (actual) |
| 1600–1919 px | 1600 px |
| 1920–2399 px | 1760 px |
| ≥ 2400 px | 1920 px |

Los gutters siguen con `clamp` y ganan un pequeño incremento en el tramo de 2400 px. Las rejillas de tarjetas (colección, búsqueda, artistas, novedades, historial) pasan de 4 a 5 columnas desde 1600 px y a 6 desde 2200 px mediante una utilidad propia o variantes arbitrarias de Tailwind, no cambiando los breakpoints globales. Los bloques de texto conservan sus `max-w-*`; el ancho extra se reparte entre columnas y espacio lateral, no estirando párrafos.

En inicio, la rejilla principal gana un tercer bloque lateral solo cuando hay contenido suficiente; en fichas de álbum la portada puede crecer hasta ~380 px y la tracklist mantiene su medida. Se evita un layout fluido sin límite porque produce líneas demasiado largas y jerarquías débiles.

### 3. Estados vacíos centrados con un wrapper común

`CollectionEmptyState` añade `mx-auto w-full` y un contenedor de altura mínima moderada (`min-h-[38vh]` o equivalente) con `place-items-center`, de modo que el bloque quede centrado horizontalmente y con aire vertical sin empujar las herramientas fuera de la vista. El mismo componente sirve a colección y pendientes, así que el cambio cubre ambos estados sin duplicar lógica. En móvil conserva el ancho disponible y los márgenes de página.

Alternativa considerada: centrar solo con `text-center`; se descarta porque el bloque sigue pegado al borde izquierdo, que es el problema reportado.

### 4. Remarcado de emociones filtradas en los badges

`collection/page.tsx` pasa `filters.moods` a `moodBadges` y `moodBadgesInline`. Cada badge calcula `isFiltered = activeMoods.includes(mood)`. El estilo filtrado usa el verde de marca (`--kanso-mint`) como fondo o borde, añade `ring`/borde y peso mayor, y un texto `sr-only` traducido («filtro activo») para que la señal no dependa solo del color. Los badges no filtrados mantienen el estilo actual por variante (cuadrícula sobre portada, lista sobre superficie). Sin filtros activos, todos quedan neutros.

No se convierten los badges en botones: el filtro se sigue gestionando desde los chips superiores, y añadir interacción dentro de la tarjeta complicaría el enlace de la portada.

### 5. Detección de colección vacía para la invitación al primer disco

Se centraliza en dos puntos, sin cambiar la API:

- `useHomeStart` reutiliza la llamada a `getCollection()` que ya hace para las etiquetas y expone `collectionCount` y `collectionStatus` (`loading` / `ready` / `error`). `StartPage` muestra la invitación al primer disco solo cuando el historial está resuelto, no hay recomendaciones y la colección está `ready` con 0 álbumes. Si la colección falla o aún carga, mantiene el mensaje genérico.
- `useRecommendation` añade `collectionEmpty: boolean | null`. Cuando el flujo por emoción devuelve `null` o el flujo por actividad devuelve un resultado sin álbum, marca `noMatch` y consulta `getCollection()` una sola vez para saber si el vacío se debe a una colección inexistente. Un fallo técnico sigue siendo `error`, no `noMatch`.
- `RecomendationPage` usa `collectionEmpty` para elegir entre la invitación al primer disco y el estado sin coincidencias existente.

Alternativa considerada: que el servidor devuelva un motivo (`empty-collection` vs `no-match`). Se descarta para no cambiar el contrato de la API en un cambio de pulido; la consulta adicional solo ocurre en el estado vacío.

### 6. Google en móvil por redirección y selector de cuenta

`lib/firebaseAuth.ts` decide el flujo según `window.matchMedia("(max-width: 1023px)")`, alineado con el breakpoint móvil de la app:

- Escritorio: `signInWithPopup`.
- Pantallas estrechas: `signInWithRedirect`, con `GoogleAuthProvider.setCustomParameters({ prompt: "select_account" })` para forzar el selector de cuenta.
- `useLoginForm` consume `getRedirectResult(auth)` al montar la pantalla de acceso: si hay usuario, navega al destino; si hay error, muestra el mensaje; si no hay resultado, no hace nada. La cancelación de redirección se trata como cancelación silenciosa.
- No se crea ni se reutiliza una sesión anónima como efecto del intento de Google. Si la redirección vuelve sin cuenta, la persona sigue en `/login` y, si ya era invitada, conserva su sesión de invitado solo porque la tenía antes, no porque el login la haya creado.

Riesgo conocido: Safari puede limitar el almacenamiento de terceros durante la redirección. Si `getRedirectResult` falla, se muestra el error y se ofrece el acceso por correo; no se reintenta automáticamente para no crear bucles.

### 7. Entrada explícita como invitado con marca de pestaña

Se añade una marca en `sessionStorage` (`kanso-guest-entry`) que solo se escribe cuando la persona pulsa explícitamente «Probar sin registrarme» o entra como invitado desde el acceso. `signInAsGuest()` reutiliza la sesión anónima existente y escribe la marca. `signOutUser()` la borra. Una marca en `sessionStorage` cumple «visita actual» y desaparece al cerrar el navegador, sin afectar a cuentas reales.

Un componente cliente `GuestSessionGuard` (montado dentro de `AuthProvider`) observa `user`, `loading` y `pathname`. Si hay un usuario anónimo sin marca y la ruta es privada (`/home`, `/search`, `/collection`, `/recommendation`, `/recomendationHistory`, `/friends`, `/settings`, `/releases`, `/artists`), redirige a `/`. Las rutas públicas (`/`, `/login`, `/f/*`) y las fichas de álbum/artista compartibles quedan accesibles. Tras la entrada explícita, la marca permite navegar y recargar dentro de la misma pestaña.

Alternativa considerada: cambiar la persistencia de Firebase a `browserSessionPersistence` para invitados. Se descarta porque obliga a alternar persistencia y puede perder la colección de invitado al recargar; la marca separa «sesión guardada» de «entrada explícita» sin tocar el dato.

### 8. PWA instalable sin prometer lo imposible

Se añade `public/manifest.webmanifest` con `name`/`short_name` Kanso, `start_url: "/"`, `display: "standalone"`, colores de fondo y tema, y el logo de 512×512 como icono `any` y `maskable`. `layout.tsx` declara `manifest` en `metadata` y `appleWebApp` (capaz, título y estilo de barra) para iOS. No se añade service worker: la app seguirá necesitando red, pero la instalación y el modo `standalone` no dependen de él.

La barra del navegador solo desaparece al abrir la app instalada; en una pestaña normal seguirá visible. Esto se refleja en el spec y en la propuesta para no vender una expectativa falsa.

## Risks / Trade-offs

- **Marca de invitado perdida al abrir una pestaña nueva** → es el comportamiento deseado (se muestra la bienvenida); la sesión anónima se reutiliza si se vuelve a entrar como invitado, así que no se pierde la colección.
- **Redirección de Google limitada por Safari/ITP** → manejo explícito de errores y acceso por correo como alternativa; no se reintenta en bucle.
- **Layout roto por el nuevo ancho máximo** → validar 1024, 1440, 1600, 1920, 2560 y 3440 px, con panel abierto y colapsado, antes de cerrar el cambio.
- **Fondo fijo con costo de repintado** → capa sin interacción, solo gradientes y `pointer-events: none`; evitar `backdrop-filter` en la capa de fondo.
- **PWA no instalable en local sin HTTPS** → probar el manifiesto en preview/producción; en local se valida el JSON y los metadatos, no el diálogo de instalación.
- **Flash breve al redirigir a un invitado restaurado** → el guard redirige en efecto de cliente y las pantallas privadas ya muestran su estado de carga; se acepta un frame de carga antes de la bienvenida.
- **Doble llamada a la colección en inicio** → se reutiliza la petición existente de etiquetas para el conteo, sin añadir otra.

## Migration Plan

- Sin migración de datos ni de API. Las sesiones anónimas existentes siguen siendo válidas; en su siguiente apertura verán la bienvenida y podrán reutilizarlas con «Probar sin registrarme».
- El manifiesto y los metadatos son aditivos; un despliegue parcial no rompe la app.
- Rollback: revertir el cambio de CSS/manifest y el guard de invitado; no hay estado persistente nuevo salvo la marca de `sessionStorage`, que caduca sola.

## Open Questions

- Ninguna que bloquee la implementación. El tamaño mínimo de iconos se cubre con el logo actual de 512×512; si más adelante se quieren capturas en el manifiesto, se añaden sin cambiar el comportamiento.
