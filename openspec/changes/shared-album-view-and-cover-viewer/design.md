# Design

## Context

Ver `proposal.md` para la motivación y `specs/` para el contrato de comportamiento.

Estado actual relevante:

- `src/app/albums/[albumId]/page.tsx` compone la ficha con `useAlbumDetail`, un fondo calculado con `FastAverageColor` sobre `imgRef`, acciones de colección, `AlbumTracklist` y un aside con los datos guardados.
- `src/app/home/pages/RecomendationPage.tsx` repite la ficha con su propio fondo fijo, portada, título, artistas, descripción, botón de Spotify, emociones y un tracklist inline que duplica el de `AlbumTracklist`.
- La portada de ambas pantallas usa `AlbumCover` dentro de un área clicable que abre el visor; el visor existe, pero el efecto de hover no está definido y el hover de la ficha se percibe como un giro.
- `AlbumCover` (introducido en `polish-visual-consistency`) centraliza el marco de portada, pero no distingue entre una portada de tarjeta y una portada que abre el visor.
- La primera implementación del visor intentó un arrastre con Framer; se descarta en favor de un paralaje sutil al hover, sin arrastre.
- `framer-motion` y `fast-average-color` ya están instalados; `ModalShell` resuelve el foco y `Esc` para modales con panel, pero su layout no sirve para un visor a pantalla completa.

## Goals / Non-Goals

**Goals:**

- Una sola ficha de álbum para detalle y recomendación, con slots para los textos, acciones y contenido propio de cada pantalla.
- Un visor de portada reutilizable, con expansión desde la portada, paralaje sutil al hover y cierre accesible.
- Mantener el fondo derivado de la portada en ambas pantallas.
- No duplicar el tracklist ni el cálculo del color.

**Non-Goals:**

- Convertir el visor en un reproductor o añadir controles de Spotify dentro de él.
- Añadir zoom con rueda o pellizco.
- Arrastrar la portada ampliada con ratón o dedo.
- Cambiar las acciones de colección del detalle ni el flujo de guardado.
- Rediseñar la navegación o el historial.

## Decisions

### 1. `AlbumShowcase` como ficha compartida

Nuevo componente presentacional `src/components/album/AlbumShowcase.tsx`:

```tsx
type AlbumShowcaseProps = {
  album: {
    id: string;
    name: string;
    images: { url: string }[];
    artists: { name: string }[];
    external_urls?: { spotify?: string };
  };
  eyebrow: ReactNode;
  description: ReactNode;
  actions: ReactNode;
  onBack: () => void;
  backLabel: string;
  aboveHero?: ReactNode;   // resumen de filtros de la recomendación
  meta?: ReactNode;        // emociones recomendadas
  aside?: ReactNode;       // panel de colección o pendientes
  tracks: TrackListItem[] | null;
  tracklistLoading?: boolean;
  coverViewTransitionName?: string;
};
```

Renderiza el fondo degradado, `kanso-main`, la acción de volver, la cabecera (portada clicable + título + artistas + descripción + acciones + `meta`), `AlbumTracklist` y el `aside`. El detalle pasa sus acciones de colección y su panel; la recomendación pasa filtros, emociones y Spotify.

- **Alternativa descartada:** dos componentes separados (uno por pantalla). La estructura volvería a divergir; el objetivo es una sola ficha.
- **Alternativa descartada:** usar `GalleryCard` o `AlbumCard`. Son tarjetas de rejilla, no una ficha de detalle.

### 2. Fondo derivado de la portada compartido

Extraer el cálculo de color de `useAlbumDetail` a un hook `useAlbumBackdrop` que reciba una `ref` a la imagen y devuelva el degradado, con el color por defecto actual. `AlbumShowcase` posee la `ref` de la portada y aplica el fondo; `useAlbumDetail` deja de calcularlo. La recomendación gana el mismo fondo derivado sin lógica nueva.

- **Alternativa descartada:** mantener el degradado fijo de la recomendación. Rompería la igualdad visual que pide el cambio.

### 3. Portada clicable y visor con expansión

La portada de `AlbumShowcase` se envuelve en un área clicable con `aria-label` de ampliar portada y usa `AlbumCover` para el marco. `AlbumCover` gana una prop `hoverZoom` (por defecto `true`) que la ficha desactiva en la portada que abre el visor: en su lugar, el área clicable aplica `cursor: zoom-in` y un brillo tenue. Al pulsarla se monta `CoverViewer`.

El visor usa `AnimatePresence` y un `motion.div` con una escala equivalente a la expansión desde la ficha (no se usa `layoutId` para no chocar con `next-view-transitions`). Con `prefers-reduced-motion`, se muestra centrada sin animación.

- **Alternativa descartada:** medir manualmente el rect y animar con transforms. Duplica lo que Framer resuelve con la escala y se desincroniza al redimensionar.
- **Alternativa descartada:** reutilizar `ModalShell`. Su panel, hero y botón de cierre están pensados para formularios; el visor necesita un fondo completo y una imagen con paralaje al hover.

### 4. Paralaje al hover, brillo y scroll bloqueado

La portada ampliada no se arrastra ni se desplaza con clic o toque. Al pasar el puntero por encima se desplaza unos píxeles (≈14 px) hacia la dirección del ratón y vuelve a su posición al salir; el efecto se implementa con `motion` y valores de movimiento con muelle (`useMotionValue` + `useSpring`) leyendo la posición del puntero relativa al centro del marco, sin `drag`. La portada queda fija en su sitio: el desplazamiento es sutil y no la saca de su alineación. Con `prefers-reduced-motion` no hay desplazamiento.

El brillo se implementa con una sombra y un degradado radial de baja opacidad sobre el marco de la portada: sigue al puntero, se intensifica con el movimiento y vuelve al salir. Al abrir se usa el bloqueo de scroll compartido y se restaura en el cleanup, aunque el visor se desmonte de golpe.

### 5. Cierre, foco y teclado

`CoverViewer` sigue el patrón de `ModalShell`: al abrir enfoca el botón de cerrar, escucha `Esc`, cierra al pulsar el fondo y devuelve el foco a la portada al cerrar. Usa `role="dialog"`, `aria-modal="true"` y `aria-label` con el nombre del álbum; el foco queda atrapado dentro del diálogo. El botón de cierre tiene etiqueta traducida (`album.closeCover`) y la portada ampliada conserva el `alt` del álbum.

### 6. Tracklist único

`AlbumTracklist` se usa en ambas pantallas con `tracks` y `loading`. La recomendación elimina su lista inline y su skeleton propio; conserva su estado de carga general antes de tener álbum, pero una vez hay álbum delega el tracklist en el componente compartido. El mensaje de «no hay pistas» también queda unificado.

### 7. Textos e i18n

Las claves nuevas del visor (`album.viewCover`, `album.closeCover`) se añaden a `src/locales/es.json` y `src/locales/en.json`. Los textos propios de cada pantalla (eyebrow, descripción, acciones) se pasan como props y siguen viviendo en su página, de modo que el detalle y la recomendación solo difieren en contenido, no en estructura.

## Risks / Trade-offs

- **La animación de escala puede chocar con la transición de vista de la portada** → Probar la apertura del visor después de navegar al detalle; si se superponen, desactivar la transición de esa portada o retrasar la apertura.
- **El paralaje de la portada ampliada se confunde con un arrastre** → Mantener el desplazamiento pequeño y sin captura de puntero; el cursor no sugiere agarre.
- **El brillo puede lavar la portada** → Opacidades bajas, sombra suave y revisión en tema claro y oscuro.
- **El movimiento del puntero puede disparar el cierre por fondo** → El cierre por fondo solo aplica fuera de la imagen; el hover no debe cerrar el visor.
- **El paralaje puede desalinear la portada** → Limitar el desplazamiento a unos pocos píxeles y volver a cero al salir o al reabrir.
- **El fondo derivado de la portada añade una lectura de color en la recomendación** → Reutilizar la caché de imagen del navegador y el color por defecto; el cálculo ya existe en el detalle.
- **El componente compartido puede crecer con demasiados slots** → Mantener las props en contenido (`eyebrow`, `description`, `actions`, `aside`, `meta`, `aboveHero`) y no añadir lógica de negocio.
- **El visor bloquea el scroll global y puede dejar el body bloqueado si se desmonta de golpe** → Restaurar el estilo en el cleanup del efecto, no solo en el cierre.
- **Cambia el copy del tracklist de la recomendación** → Es parte de la unificación; revisar las traducciones en ambos idiomas.

## Migration Plan

No hay migración de datos ni cambios de API. Se despliega con el frontend:

1. Extraer `useAlbumBackdrop` y crear `AlbumShowcase`.
2. Migrar el detalle de álbum.
3. Migrar la recomendación y unificar el tracklist.
4. Añadir `CoverViewer`, conectar la portada y comprobar que el paralaje responde al hover de la portada ampliada, que el hover no transforma la ficha y que el brillo sigue al puntero.
5. Verificar en ambos temas, anchos y con movimiento reducido.
6. Rollback: revertir el commit; no hay estado persistido.

## Open Questions

Ninguna.
