# Design

## Context

Ver `proposal.md` — Why. El punto de partida inmediato es `polish-ultrawide-mobile-and-collection`, que define `adaptive-layout` y ya dejó en el árbol de trabajo los tramos de `--page-max` (1440 / 1600 / 1760 / 1920) y las columnas extra `2xl:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6`. Ese cambio sigue activo y sin archivar, igual que `collection-experience` y `collection-ui-polish`.

- La cuadrícula de colección e historial usa `grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 2200:grid-cols-6`; a 1536 px la tarjeta baja de ~320 a ~260 px.
- `--page-max` se queda en 1920 px a partir de 2400 px de viewport, así que en 2560 px quedan ~320 px libres a cada lado.
- `RecomendationPage` recibe `format` y `tags`, pero no los pinta. La vía rápida se distingue hoy solo por la ausencia de emociones y actividad.
- Existen las etiquetas `quickRecommendation.*` para formato y `tags.categories.*` para la categoría de una etiqueta.

## Goals / Non-Goals

**Goals:**

- Devolver a colección e histórico un ancho de tarjeta estable de 300–320 px, independiente del viewport.
- Aprovechar el ancho extra con más columnas del mismo tamaño, no con tarjetas más pequeñas.
- Mostrar al principio del resultado de recomendación rápida el formato y las etiquetas aplicados.

**Non-Goals:**

- Cambiar las rejillas de búsqueda, artistas o novedades.
- Tocar el flujo, el algoritmo ni la API de recomendación.
- Resolver las demás tareas de `polish-ultrawide-mobile-and-collection` (fondo, autenticación, PWA).

## Decisions

### 1. Rejilla de álbumes con ancho de tarjeta acotado

Se sustituyen las columnas por breakpoint de colección e historial por una utilidad compartida en `globals.css`:

```css
.kanso-album-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.75rem 1rem;
}

@media (min-width: 768px) {
  .kanso-album-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 316px));
    justify-content: center;
  }
}
```

El máximo es 316 px y no 320 porque `auto-fit` calcula el número de pistas con el tamaño máximo. Con la barra lateral de 230 px, el área útil a 1440 px es de ~1095 px: cuatro pistas de 320 px no caben y la rejilla caería a tres columnas de 320. Con 316 px caben tres columnas a 1440, cuatro a 1920 y seis a 2400, con tarjetas de 316 px. En móvil se conservan las dos columnas y en `md` se mantiene el centrado del sobrante para que la última fila no quede pegada a la izquierda.

Alternativas consideradas:

- `repeat(auto-fill, minmax(280px, 1fr))`: las tarjetas se estiran por encima de 320 px y el tamaño vuelve a depender del viewport.
- Mantener breakpoints y añadir un `max-w` por tarjeta: deja huecos irregulares entre columnas y obliga a repetir clases en cada página.
- Ancho fijo de 320 px exactos: a 1440 no caben cuatro columnas (1328 px frente a 1325 px útiles) y se cae a tres.

La misma clase se aplica a la cuadrícula de esqueletos (`GallerySkeleton`) para que la carga no cambie el ritmo.

### 2. Tramos de ancho máximo

Se ajustan los tramos de `--page-max` para que el contenido siga creciendo más allá de 1920 px:

| Viewport     | Ancho máximo |
| ------------ | ------------ |
| < 1600 px    | 1440 px      |
| 1600–1919 px | 1600 px      |
| 1920–2399 px | 2080 px      |
| ≥ 2400 px    | 2400 px      |

Los gutters no cambian. Los bloques de texto conservan sus `max-w-*`, así que el ancho extra se lo lleva la rejilla, no los párrafos. A 2560 px el margen baja de ~320 px por lado a ~80 px; a 3440 px se mantiene el tope de 2400 px y el contenido queda centrado.

Alternativa considerada: contenedor sin tope. Se descarta porque en 3440 px produce líneas de texto y filas de 11 tarjetas sin jerarquía; el tope de 2400 px mantiene la composición reconocible.

### 3. Resumen de filtros con una marca explícita en la URL

`buildQuickRecommendationHref` añade `quick=1`. `recommendation/page.tsx` lee ese parámetro y pasa `isQuick` a `RecomendationPage`. No se infiere de la ausencia de emociones porque el flujo normal también permite confirmar sin selección.

`RecomendationPage` pinta un componente presentacional `RecommendationFilterSummary` justo después del botón «Volver» y antes de la sección de portada y título. El resumen:

- Muestra siempre el formato: `quickRecommendation.anyFormat`, `vinyl`, `cd` o `cassette`.
- Añade un chip por etiqueta con el formato `Categoría: valor`, usando `tagCategoryI18nKey` y `tags.categories.*`.
- Lleva una etiqueta visible `quickRecommendation.filtersLabel` («Filtros aplicados») y se agrupa en una lista con `aria-label`.
- No se renderiza si `isQuick` es falso.

Alternativas consideradas:

- Colocarlo dentro de la columna de información del álbum: en móvil queda por debajo de la portada y deja de ser lo primero que se ve.
- Reutilizar el párrafo «Un álbum seleccionado a partir de tu…»: mezcla contexto y filtros y no permite separar formato de etiqueta.
- Deducir la vía rápida por `moods.length === 0`: un envío normal sin emoción se marcaría como rápido por error.

### 4. Orden de archivo

Este cambio se apoya en requisitos que todavía viven en cambios sin archivar. El orden es:

1. `collection-experience`
2. `collection-ui-polish`
3. `polish-ultrawide-mobile-and-collection`
4. `refine-grid-and-quick-recommendation`

Los tres primeros deben archivar sus deltas antes de archivar este, o la spec principal de `album-collection` perdería la presentación que este cambio asume.

## Risks / Trade-offs

- **Conflicto con el diseño de `polish-ultrawide-mobile-and-collection`** → este cambio reemplaza su tabla de tramos y sus columnas extra; se anota el orden de archivo y se actualiza la tabla de ese cambio al archivarlo.
- **Centrado de la cuadrícula con pocos álbumes** → `justify-content: center` deja la última fila centrada; se acepta porque evita el hueco asimétrico a la derecha y se revisa con 1, 2 y 5 elementos.
- **Contenedor más ancho en pantallas con mucho texto** → los `max-w` existentes evitan líneas largas; se revisa inicio, álbum, búsqueda y ajustes a 2400 px.
- **Etiquetas con `:` en el valor** → se parte por el primer `:` y se conserva el resto como valor.
- **Enlaces antiguos a la recomendación rápida sin `quick=1`** → no muestran el resumen; es un enlace ya compartido, no hay migración necesaria.

## Migration Plan

- Sin migración de datos ni de API. El parámetro `quick=1` es aditivo.
- Despliegue único de CSS, componentes y textos; rollback revirtiendo esos archivos.
- Antes de archivar, validar los cuatro cambios con `openspec validate --strict` en el orden indicado.
