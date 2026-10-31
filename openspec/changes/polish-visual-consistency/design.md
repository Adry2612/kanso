# Design

## Context

Ver `proposal.md` para la motivación y `specs/` para el contrato de comportamiento.

Estado actual relevante:

- `GalleryCard` y `GalleryRow` dibujan su propia portada con `rounded-2xl`/`rounded-xl`, borde, fondo y degradado. `AlbumCard` (buscador y artistas), `SharedAlbumCard` y la página de novedades duplican ese marcado con radios y tratamientos distintos.
- `AlbumCard` navega al detalle con un `motion.article` clicable; la página de novedades usa un `article` propio con `onClick`.
- `AlbumCard` envuelve la portada en `kanso-card` con padding y `whileHover={{ y: -6 }}`, mientras colección e historial usan `GalleryCard` sin panel ni elevación; el marco de portada es el mismo, pero la composición de la tarjeta no.
- `moodBadges` y `moodBadgesInline` en `src/app/collection/page.tsx` hacen `slice(0, max)` sobre `labeledFeelings ?? moods` en el orden guardado; el remarcado se calcula después, así que una emoción filtrada puede quedar fuera del límite.
- `.kanso-album-grid` aplica `justify-content: center` desde 768 px y lo comparten colección, historial y `GallerySkeleton`.
- Los estados vacíos se implementan pantalla a pantalla: unos ya usan `text-center` con `mx-auto` y otros son párrafos alineados a la izquierda.
- Tailwind 4 no añade `cursor: pointer` a los botones en su preflight; solo hay dos `cursor-pointer` explícitos en el proyecto.
- Los cambios `polish-ultrawide-mobile-and-collection` y `refine-grid-and-quick-recommendation` siguen activos: el remarcado de cápsulas y el ancho estable del historial viven en sus deltas, todavía sin archivar.

## Goals / Non-Goals

**Goals:**

- Un solo componente de portada usado por buscador, novedades, colección, historial y biblioteca compartida, con el mínimo de variantes posible.
- Una composición de tarjeta de resultados del buscador alineada con colección e historial, sin cambiar la jerarquía de datos.
- Que las emociones filtradas sean siempre visibles y las primeras, sin romper el orden estable del resto.
- Un criterio único de centrado para estados vacíos, aplicado con clases y sin duplicar estructura.
- Alinear solo el historial a la izquierda, sin tocar el centrado de la colección.
- Resolver la afordancia del cursor con una regla base, no con decenas de clases sueltas.

**Non-Goals:**

- Rediseñar la jerarquía de información de las tarjetas de colección, historial, novedades y artistas. El buscador sí ajusta su composición visual para igualar la de colección e historial.
- Cambiar el número de cápsulas visibles (2 en cuadrícula, 3 en lista).
- Introducir un sistema de diseño nuevo, tokens nuevos o dependencias.
- Tocar datos, API, Firestore o lógica de recomendación.
- Unificar los estados vacíos en un componente único: cada pantalla conserva su icono, copia y acción.

## Decisions

### 1. `AlbumCover` compartido en `src/components/AlbumCover.tsx`

Extrae el marco de `GalleryCard`/`GalleryRow`:

```tsx
type AlbumCoverProps = {
  src?: string;
  alt: string;
  className?: string;   // tamaño y radio del contenedor
  priority?: boolean;
};
```

Renderiza un contenedor `relative aspect-square overflow-hidden border border-[var(--kanso-line)] bg-[var(--surface-2)]` con `img` diferida, degradado inferior, zoom en `group-hover` y un `Music2` centrado cuando no hay `src`. El `className` permite los tamaños compactos de `GalleryRow` (`h-14 w-14 sm:h-16 sm:w-16`) sin duplicar el marcado.

- **Alternativa descartada:** reutilizar `GalleryCard` entero en buscador y novedades. Añadiría el botón de escuchar y una estructura de título distinta a tarjetas que ya tienen sus propias acciones (añadir, tipo de lanzamiento).
- **Alternativa descartada:** solo copiar las clases. Mantiene cinco copias del marco y vuelve a divergir en el siguiente cambio.

`AlbumCard`, `SharedAlbumCard`, `GalleryCard` y `GalleryRow` pasan a usar `AlbumCover`. La página de novedades reutiliza `AlbumCard` con un slot `footer` para el tipo y la fecha del lanzamiento, eliminando su `article` duplicado y su `cursor-pointer` manual.

`AlbumCard` gana una variante `plain` (por defecto, `panel`) que usan solo las dos rejillas del buscador: retira `kanso-card`, el padding del panel y el `whileHover` de elevación; mantiene el bloque de texto, el botón de añadir y los estados de colección/pendientes. Las tarjetas de novedades y artistas conservan la variante con panel. `AlbumGridSkeleton` acompaña al buscador con la misma composición sin panel.

`shared-album-view-and-cover-viewer` amplía después `AlbumCover` con `imageRef`, `crossOrigin` y `hoverZoom` para la ficha y el visor; este cambio solo depende del marco base y no requiere esas props.

- **Alternativa descartada:** reutilizar `GalleryCard` con un footer para el botón de añadir. Añade el botón de escuchar, que el buscador no necesita, y acopla el buscador a la API de la galería.

### 2. Priorización estable de emociones en una utilidad pura

Añadir a `src/utils/collection.ts`:

```ts
export function prioritizeMoods<T extends string>(
  moods: T[],
  highlighted: string[],
): T[];
```

Hace una partición estable: primero las emociones cuyo `normalizeMood` está en `highlighted`, después el resto, sin reordenar dentro de cada grupo. `moodBadges` y `moodBadgesInline` calculan `ordered = prioritizeMoods(itemMoods, filters.moods)`, muestran `ordered.slice(0, max)` y calculan `ordered.length - max` para el `+N`.

- Se mantiene el límite actual (2 en cuadrícula, 3 en lista) y el remarcado existente.
- Sin filtro, `highlighted` está vacío y la partición devuelve el orden original, por lo que el comportamiento neutro no cambia.
- **Alternativa descartada:** ordenar dentro del render con `sort`. Un `sort` inestable o comparar por índice complica el desempate; la partición es O(n) y predecible.

### 3. Estados vacíos: centrado con clases compartidas

Añadir en `src/app/globals.css`:

```css
.kanso-empty {
  margin-inline: auto;
  width: 100%;
  text-align: center;
}
```

El ancho máximo legible lo aporta cada pantalla con `max-w-xl`/`max-w-2xl`. No se fija dentro de `.kanso-empty` porque Tailwind 4 coloca las utilidades en capas y un `max-width` sin capa anularía las de cada pantalla.

Se aplica junto a las clases existentes en:

- `recomendationHistory`: ambos bloques (`noHistory` y `noMatches`), añadiendo `mx-auto` al bloque y conservando su `max-w-xl`.
- `releases` y `artists`: los párrafos de vacío pasan a `kanso-empty` con su `max-w-2xl` y padding actuales.
- `search`: el bloque de sin resultados y el panel previo a la consulta se centran; en el panel previo, los grupos de chips usan `justify-center` y el texto introductorio se centra, sin cambiar las sugerencias. También se centra el mensaje de «Añadidos por la comunidad» cuando no hay ejemplos.
- `friends`, `friends/[uid]` y la muestra pública de la portada (`src/app/page.tsx`) reciben el mismo centrado para sus vacíos de solicitudes, biblioteca compartida y álbumes públicos.
- `home/pages/StartPage`: el bloque de recientes se centra dentro de su tarjeta lateral (`text-center`), no respecto a la página.
- `collection` y `friends` ya están centrados y no se tocan, salvo verificar que cumplen el mismo criterio.

- **Alternativa descartada:** crear un `EmptyState` único. Obligaría a unificar iconos, copias y acciones de seis pantallas, un alcance mayor que el pedido.

### 4. Variante de rejilla alineada a la izquierda

Añadir a `globals.css`:

```css
@media (min-width: 768px) {
  .kanso-album-grid--start {
    justify-content: start;
  }
}
```

Se aplica solo al `Stagger` del historial. La colección conserva `.kanso-album-grid` centrado y `GallerySkeleton` no cambia. En el historial, el esqueleto de carga puede quedar centrado durante la carga; es un estado transitorio y no altera el layout final.

- **Alternativa descartada:** cambiar `.kanso-album-grid` a `start` globalmente. Rompería el centrado de la colección y el ajuste ya acordado en `refine-grid-and-quick-recommendation`.

### 5. Cursor con regla base

En `globals.css`, después del preflight:

```css
button:not(:disabled),
[role="button"]:not([aria-disabled="true"]),
summary {
  cursor: pointer;
}

button:disabled,
[aria-disabled="true"] {
  cursor: not-allowed;
}
```

Los enlaces ya muestran puntero por defecto. Los contenedores clicables que no son botones (`AlbumCard`, novedades) conservan su `cursor-pointer` explícito; el resto de la app usa botones nativos. Se revisan los `disabled` que ya aplican `disabled:cursor-not-allowed` para que la regla no entre en conflicto.

- **Alternativa descartada:** añadir `cursor-pointer` a cada `className`. Es fácil olvidar controles nuevos y ya hay decenas de botones.

### 6. Deltas aditivos para no depender del archivado pendiente

`album-collection` y `recommendations` reciben requisitos **ADDED** con nombre propio (`Prioridad de las emociones filtradas…`, `Alineación a la izquierda…`) en lugar de **MODIFIED** sobre requisitos que aún viven en deltas sin archivar. Así este cambio se puede aplicar y archivar en cualquier orden respecto a `polish-ultrawide-mobile-and-collection` y `refine-grid-and-quick-recommendation`, sin perder texto al sincronizar.

## Risks / Trade-offs

- **Cambio visual en buscador, artistas y novedades al unificar el radio de portada** → Verificar las tres pantallas a 320, 390, 768 y 1440 px y confirmar que el marco no recorta títulos ni acciones.
- **La variante plana puede descolocar el botón de añadir o los estados de pendientes** → Conservar el bloque de texto y verificar resultados con y sin acción a 390 y 1440 px.
- **`AlbumCard` con `footer` puede romper el layout de las tarjetas del buscador** → El slot es opcional y se renderiza al final del bloque de texto; comprobar que sin `footer` el resultado es idéntico al actual.
- **La priorización puede dejar fuera una emoción no filtrada que antes se veía** → Es el comportamiento pedido; el `+N` debe reflejarlo y los tests de datos sintéticos deben cubrir el caso.
- **El centrado de estados vacíos puede descolocar paneles con sugerencias** → En el buscador solo se centra el texto y los chips; no se cambia el orden ni el contenido de las sugerencias.
- **La regla global de cursor puede afectar a elementos no interactivos con `role="button"`** → Revisar que todo `role="button"` tenga interacción real; si alguno es solo semántico, corregir el rol antes de dar la tarea por cerrada.
- **Duplicidad conceptual entre el nuevo requisito de alineación y el de ancho del historial** → Se acepta para no acoplar el archivado; ambos son compatibles y conviene fusionarlos en una limpieza futura del spec principal.

## Migration Plan

No hay migración de datos ni cambios de API. El cambio se despliega con el resto del frontend:

1. Añadir `AlbumCover`, las utilidades y los estilos.
2. Migrar las tarjetas, aplicar la variante plana solo al buscador y ajustar las pantallas de estados vacíos.
3. Verificar en local y desplegar.
4. Rollback: revertir el commit; no hay estado persistido ni contratos afectados.

## Open Questions

Ninguna.
