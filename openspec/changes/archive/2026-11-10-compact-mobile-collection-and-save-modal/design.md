# Design

## Context

Ver `proposal.md` para la motivación y los deltas de `specs/` para el contrato de comportamiento. El estado actual que condiciona el enfoque:

- `ModalShell` compone todos los modales con un panel `flex` de altura máxima `88%` de la altura visible, una cabecera hero de `176px` (`128px` solo para `.save-album-modal`) y un cierre flotante. El panel recorta con `overflow: hidden`; cada modal decide si su cuerpo se desplaza.
- `SuccessAlbumModal` pinta su contenido en `.album-art-modal-body`, que no tiene `min-h-0` ni `overflow-y`. Cuando el contenido supera el panel, no se desplaza: se recorta. Las acciones y el bloque de deshacer quedan fuera de la vista.
- `SaveAlbumModal` sí tiene un cuerpo con `overflow-y-auto`, pero la cabecera (hero + fila del álbum + stepper de tres columnas) consume en móvil entre 300 y 380 px antes del paso. El paso 3 añade formatos, ayuda, idioma y género completos, así que el botón de guardar exige desplazarse.
- `AlbumCover` aplica siempre un degradado `from-black/70 via-black/5 to-transparent` sobre la portada, incluso cuando no hay contenido superpuesto (por ejemplo, en la ficha del álbum). `GalleryCard` superpone dos emociones, un contador `+N` y el botón de escuchar; en una tarjeta de ~170 px de ancho en 390 px, ese contenido ocupa buena parte de la mitad inferior y, junto al velo, apaga la portada.
- La colección apila encima de la cuadrícula: encabezado con subtítulo y estadísticas, pestañas con `mt-10 mb-8`, buscador + orden/filtro/vista con `mt-8`, y chips de emoción que envuelven en tres filas a 390 px. La primera fila de discos queda por debajo del pliegue.
- Restricciones del proyecto: Tailwind 4 y tokens en `src/app/globals.css`, textos en `es.json` y `en.json`, sin dependencias nuevas, y la altura visible ya modelada con `--visual-viewport-height` y `data-visual-viewport="short"`.

## Goals / Non-Goals

**Goals:**

- Un modal nunca recorta contenido: el cuerpo es la única región desplazable y las acciones permanecen visibles.
- El paso de formato se completa sin desplazarse salvo al desplegar idioma y género, que queda explícitamente opcional.
- En 390 × 844 px, la primera fila de discos entra en la vista inicial y la portada se lee sin competir con el contenido superpuesto.

**Non-Goals:**

- Cambiar el modelo de datos, el orden de los pasos, los filtros disponibles ni la API.
- Introducir un sistema de densidad configurable o una preferencia de usuario.
- Rediseñar la ficha del álbum o la vista de lista más allá de reutilizar los badges existentes.
- Reemplazar `ModalShell` por otro componente o tocar los modales sin hero (ordenar, filtrar).

## Decisions

### 1. El cuerpo del modal es la única región que se desplaza

Se añade una clase compartida `.modal-shell-scroll` (`min-height: 0; flex: 1 1 auto; overflow-y: auto; overscroll-behavior: contain`) y se aplica al cuerpo de `SuccessAlbumModal`, al de `SaveAlbumModal` y a las variantes de álbum ya guardado y pendiente (que ya tenían las utilidades equivalentes en el asistente). La fila del álbum queda fuera del área desplazable para que la portada siga montada sobre el hero sin recortarse; el resto del contenido se desplaza dentro.

El panel mantiene `overflow: hidden` y su `max-height` actual: la suma de hero + cabecera + cuerpo + acciones se resuelve en el flex, y el cuerpo absorbe la diferencia. Se descarta aumentar `max-height` porque en pantallas cortas seguiría recortando y porque taparía el área segura inferior.

Como refuerzo del mismo contrato, `.modal-shell-overlay` deja de aportar un segundo scroll vertical para modales: el panel se ajusta a la altura y el desplazamiento ocurre dentro. Se conserva su `overflow-y: auto` únicamente como red de seguridad para alturas extremas, sin que el panel pueda crecer más allá del viewport.

### 2. Hoja inferior móvil ajustada al contenido

En `@media (max-width: 1023px)` el asistente y las modales de resultado se presentan como una hoja inferior (`mobileSheet` en `ModalShell`): ocupa el ancho completo, se ancla al borde inferior, redondea solo las esquinas superiores y su alto depende del contenido, con un máximo de `92dvh` y el área segura inferior respetada. El hero se oculta y la identidad del álbum pasa a una tarjeta con portada de 56 px, título y artista; una barra de arrastre superior y el cierre completan la cabecera.

Se descarta la cabecera compacta anterior dentro de un panel a pantalla completa: dejaba un cuerpo enorme y vacío, y el formulario parecía una pantalla de ajustes. La hoja se ajusta a cada paso, desaparece el espacio muerto y el fondo de la página sigue visible, así que se entiende que es un modal. Si el contenido supera `92dvh`, solo el cuerpo se desplaza y las acciones permanecen ancladas.

Desde 768 px el modal deja de ser hoja y pasa a una composición horizontal: dos columnas, la foto del artista a la izquierda y la identidad del álbum, el paso y las acciones a la derecha. El panel mide `min(56rem, 100vw - 2rem)` y `min(88vh, 44rem)`, de modo que el ancho sustituye al alto y el contenido cabe sin scroll. Para eso `ModalShell` envuelve a sus hijos en `.modal-shell-content`, que conserva la columna flex de siempre; solo la composición horizontal convierte el panel en grid.

Así la foto del artista vuelve a verse en escritorio aunque la ventana no sea muy alta, y el hero deja de robar altura al formulario. Por debajo de 768 px se mantiene la hoja inferior.

Las modales de resultado usan la misma hoja, con las acciones en fila y «Deshacer» debajo. El stepper del asistente se sustituye por tres barras sin etiqueta visible, con el texto de cada paso en `sr-only` y `aria-current` intacto; las etiquetas repetían el «Paso N» del contenido. En `sm` recupera las etiquetas.

### 3. Idioma y género como segunda sección del paso 3

El paso 3 mantiene dos secciones en el mismo paso: «Formato» (obligatoria) e «Idioma y género» (opcional), con un selector segmentado (`role="group"`, `aria-pressed`) encima del contenido. Cada opción resume su estado: «1 formato» o «Opcional · Español · Rock». El pie no cambia nunca: «← Atrás» y «Guardar álbum».

Se descarta el `<details>` inline: desplegaba los selectores, empujaba el resumen fuera de la vista y obligaba a desplazarse para cerrarlo. También se descarta un cuarto paso: alargaba el flujo por un dato opcional y rompía la promesa de tres pasos. La pestaña da lo mejor de ambos: la sección se ve, no añade navegación y el pie conserva un único significado.

Dentro de la sección opcional, idioma y género usan el carril horizontal compartido (`OptionSelector` en modo `carousel`) y se colocan en dos columnas desde `md`: en 1280 × 650 el cuerpo queda en 253 px y toda la sección cabe sin scroll. En móvil se apilan.

Los carriles de selección única centran la opción elegida al abrir (si no está entre las primeras), de modo que un género como «Hip-Hop» no queda fuera de la vista. Las columnas del bloque llevan `min-width: 0` para que el carril no ensanche la columna con su pista de `max-content`; sin eso, el carril medía 1623 px dentro de una columna de 250 px y los controles quedaban fuera del modal.

### 4. Confirmación de guardado que cabe completa

La confirmación reutiliza la hoja inferior y su tarjeta de identidad, con acciones y «Deshacer» fuera del cuerpo. La hoja mide lo que mide su contenido, sin alto fijo: con seis emociones relacionadas cabe entera en 390 × 650 y no hay desplazamiento. Si hay más emociones o la pantalla es de 320 × 568, el cuerpo es la única región desplazable y las acciones nunca se pierden.

El aviso de error del asistente y las acciones siguen el mismo patrón: fuera del scroll, pegados al borde inferior del panel.

### 5. Portada sin velo permanente y contenido superpuesto mínimo

`AlbumCover` deja de pintar el degradado global. En su lugar acepta un prop `scrim?: "none" | "soft"` (por defecto `none`): `soft` pinta un degradado corto en el tercio inferior (`from-black/55 to-transparent`) para dar contraste a contenido superpuesto. `GalleryCard` lo usa; `GalleryRow`, `AlbumCard`, `SharedAlbumCard` y `AlbumShowcase` quedan sin velo. Esto restaura la legibilidad de la portada en la ficha y en las tarjetas.

Sobre la tarjeta, el número de emociones visibles depende del ancho: una emoción y el contador `+N` por debajo de 640 px, dos y `+N` desde 640 px. Como el contador debe conocer cuántas quedan, se renderizan dos juegos de cápsulas con `sm:hidden` / `hidden sm:flex`; el juego oculto sale del árbol de accesibilidad con `display: none`. Se descarta medir el viewport en JavaScript para no introducir un salto de hidratación ni un efecto de resize. La emoción filtrada sigue saliendo primera porque `prioritizeMoods` ya ordena la lista antes de recortarla.

Se añade al contador un texto accesible («… y N emociones más») con una clave nueva en `collection`. El botón de escuchar conserva sus 36 px de lado (objetivo táctil cómodo) pero sube la opacidad del fondo para no depender del velo. El badge de emoción se reduce a `px-1.5 py-0.5` en móvil para no ocupar dos líneas.

Los carriles de opciones (`OptionRail`, compartido por emociones, actividades e idioma/género) desvanecen el contenido en el borde que continúa mediante una máscara, en lugar de cortar la tarjeta a media. La máscara solo se activa en los lados donde `canScrollLeft`/`canScrollRight` es cierto, de modo que el primer elemento no aparece difuminado al abrir.

### 6. Ritmo vertical compacto de la colección en móvil

Los ajustes se hacen con utilidades responsive en los componentes, no con reglas globales nuevas:

| Bloque              | Móvil                      | Desde `md`                |
| ------------------- | -------------------------- | ------------------------- |
| Título de colección | `text-3xl`                 | `text-5xl`                |
| Subtítulo           | `mt-2 text-sm`             | `mt-4`                    |
| Estadísticas        | `mt-3 gap-x-3`             | `mt-5 gap-x-4`            |
| Pestañas            | `mt-6 mb-6`                | `mt-12 mb-8`              |
| Buscador y botones  | `mt-5`, botones `py-2`     | `mt-8`, `py-2.5`          |
| Chips de emoción    | una fila `overflow-x-auto` | envoltura en varias filas |

Los chips móviles se convierten en un carril horizontal (`flex-nowrap`, `shrink-0`, `snap-x`, sin barra visible) con «Todas» primero, padding lateral para que el foco no quede recortado y un degradado lateral tenue como pista de desplazamiento. Se conserva la envoltura actual desde `sm`/`md` porque ahí el ancho permite ver todas las emociones sin gesto.

Alternativa descartada: ocultar emociones tras un botón «Filtros»; añade un paso y esconde un control que hoy se usa con un toque. Alternativa descartada: reducir el número de emociones; son datos, no chrome.

La cuadrícula reduce su margen superior (`mt-6` en móvil, `mt-10` en escritorio) y mantiene dos columnas. Con la suma de recortes (título, pestañas, buscador, chips y margen) la primera fila de discos entra en la vista inicial de 390 × 844 px y la cabecera superior de la app deja de empujarla.

### 7. El modal se monta en `body`, fuera del contexto de apilamiento del contenido

Durante la implementación se comprobó que el overlay vivía dentro de `.app-content`, que abre su propio contexto de apilamiento (`position: relative; z-index: 1`). La barra móvil (`z-index: 30`) quedaba por encima del modal (`z-index: 50`) y, en el asistente a pantalla completa, tapaba el botón de cierre. `ModalShell` pasa a renderizar el diálogo con `createPortal` en `document.body`: así comparte el nivel raíz con la barra y el `z-index` del overlay vuelve a mandar.

Se descarta subir el `z-index` de `.app-content` o bajar el de la barra porque rompería la relación normal entre chrome y contenido. También se descarta compensar el overlay con un `top` fijo: no todas las pantallas tienen barra y el área segura cambia por dispositivo.

Como efecto secundario, los modales sin hero (ordenar, filtrar, compartir) también pasan por encima de la barra, que es el comportamiento esperado de un modal y no cambia su estructura interna.

### 8. Pantallas cortas: menos márgenes y acciones en fila

Cuando `data-visual-viewport="short"` (alto visible menor de 620 px), el hero de los modales que aún lo conservan baja a 72 px, la portada a 64 px y las acciones `--roomy` vuelven a una fila. En el asistente y en las modales de resultado el hero ya está oculto, así que la regla actúa sobre el resto de modales. En 320 × 568 los cuatro formatos y el acceso a idioma y género caben sin scroll; la confirmación con seis emociones puede seguir desplazando su cuerpo.

## Risks / Trade-offs

- **Mostrar una sola emoción en móvil oculta información** → la vista de lista y la ficha del álbum muestran todas, el contador indica cuántas hay y el lector de pantalla las anuncia.
- **Un carril horizontal puede esconder filtros** → «Todas» va primero, hay pista visual de desplazamiento y `snap` para que cada chip quede alineado; en pantallas mayores se recupera la envoltura.
- **El stepper sin etiquetas puede perder contexto** → cada paso conserva «Paso N» en el contenido y el `ol` mantiene etiquetas `sr-only` y `aria-current`.
- **La vista opcional añade un nivel de navegación** → el pie cambia a «← Formatos» y mantiene «Guardar álbum», así que el retorno siempre está a la vista; la selección vive en el asistente y no se pierde al cambiar de vista.
- **Dos juegos de badges duplican DOM** → son cuatro o cinco nodos por tarjeta, sin lógica ni listeners, y el oculto no se renderiza visualmente ni se anuncia.
- **La cabecera compacta afecta a todos los modales con hero** → el ajuste es solo por debajo de 1024 px y mantiene portada, título y artista; escritorio no cambia.

## Migration Plan

Sin migración de datos. El cambio es de presentación y se despliega con el resto de la aplicación; la reversión es un revert del commit, sin estado persistido ni pasos de limpieza.
