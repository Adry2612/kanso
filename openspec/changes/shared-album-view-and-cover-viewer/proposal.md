# Proposal

## Why

El detalle de álbum y el resultado de una recomendación muestran prácticamente la misma ficha —portada, título, artistas y tracklist— pero viven en dos implementaciones que ya han divergido en fondo, tipografía y lista de pistas. Además, la portada no se puede apreciar a tamaño completo: hoy es solo una imagen dentro de la ficha. La primera implementación del visor dejó la portada centrada sin responder de forma fiable al hover, y el zoom de la ficha se percibe como un giro; el efecto tampoco tiene una respuesta visual que lo haga creíble.

## What Changes

- **Ficha de álbum compartida**: extraer una vista común para detalle y recomendación con el mismo fondo derivado de la portada, la misma cabecera (volver, portada, título, artistas, descripción) y el mismo bloque de tracklist. Cada pantalla aporta sus textos, acciones y contenido propio.
- **Detalle de álbum**: conserva las acciones de colección (añadir, editar, eliminar), el panel de datos guardados y el modal de guardado.
- **Recomendación**: conserva el resumen de filtros, las emociones recomendadas y el botón de Spotify; no muestra acciones de colección ni el panel de datos. Su tracklist deja de estar duplicado y usa el mismo componente que el detalle.
- **Visor de portada**: al pulsar la portada en cualquiera de las dos pantallas, esta se traslada al centro y se amplía sobre un fondo oscuro. La portada ampliada no se arrastra ni se mueve con clic o toque: al pasar el puntero por encima se desplaza unos píxeles hacia la dirección del ratón (paralaje) y queda fija en su sitio, con un brillo tenue que se intensifica con el movimiento. La portada de la ficha ya no se inclina ni parece girar al pasar el puntero: el hover solo muestra un brillo de invitación. Se cierra con `Esc`, clic fuera o el botón de cerrar; atrapa el foco, bloquea el scroll de fondo y respeta `prefers-reduced-motion`.

## Capabilities

### New Capabilities

- `album-cover-viewer`: apertura, ampliación, respuesta sutil al hover y cierre accesible de la portada a pantalla completa.

### Modified Capabilities

- `recommendations`: el resultado de una recomendación presenta la misma ficha de álbum que el detalle (fondo, cabecera y tracklist), con sus filtros, emociones y acciones propias.

## Impact

- Nuevos componentes: ficha compartida de álbum y visor de portada.
- Pantallas: `src/app/albums/[albumId]/page.tsx` y `src/app/home/pages/RecomendationPage.tsx`.
- Componentes reutilizados: `AlbumTracklist`, `AlbumCover` y el fondo derivado de la portada.
- Estilos: `src/app/globals.css` para el visor, el brillo y el paralaje al hover, y el bloqueo de scroll.
- Sin cambios de API, datos ni dependencias. `framer-motion` y `fast-average-color` ya están en el proyecto.
