# Design

## Context

- `FeelingsCarousel` (inicio) y `OptionCarousel` (asistente) implementan el mismo carril dos veces: scroll horizontal, flechas, snap, teclado y barras ocultas.
- Los formatos se pintan de tres formas: emojis en `FilterModal`, botones de texto con estilos inline en `StartPage` y botones con clases propias en `SaveAlbumFormatStep`.
- `MoodSelector` pinta sus opciones con utilidades inline y `Medallion`; el carrusel del inicio usa `.feeling-option`.
- El carril de opciones usa `padding: 0.125rem` y `margin: -0.125rem`, y el carril de emociones usa `scroll-padding-inline` distinto del padding del track. Esa asimetría explica el recorte antes del borde.
- `lucide-react` ya está instalado y expone `Disc3`, `Disc`, `CassetteTape`, `HardDrive` y `Library`; no hace falta una dependencia nueva.

## Goals / Non-Goals

**Goals:**

- Un solo botón y un solo carril para emoción, actividad y formato.
- Iconos en los formatos sin perder la etiqueta accesible.
- Que el último elemento se vea completo al llegar al final.
- Conservar selección, roles, teclado, buscador y movimiento reducido.

**Non-Goals:**

- Migrar filtros de género, etiquetas, ordenación o idioma.
- Cambiar la interacción del carrusel (sigues pudiendo arrastrar, usar rueda y flechas).
- Cambiar datos, API o los formatos canónicos.
- Rediseñar la ficha del álbum o la página de colección.

## Decisions

### 1. Componentes compartidos

Nuevo directorio `src/components/selectors/`:

```ts
type OptionItem = {
  key: string;
  label: string;
  icon?: ReactNode;   // formato
  emoji?: string;     // emoción o actividad
  disabled?: boolean;
};

type OptionSelectorProps = {
  options: OptionItem[];
  selectedKeys: string[];
  onSelect: (key: string) => void;
  selection?: "single" | "multiple"; // multiple por defecto
  layout?: "grid" | "carousel";      // grid por defecto
  ariaLabel: string;
  className?: string;
  search?: { open: boolean; onOpenChange: (open: boolean) => void };
};
```

- `OptionButton`: botón único con `data-selected`, `data-active`, foco visible, icono o medallón y etiqueta. En selección múltiple usa `aria-pressed`; en única, `role="radio"` y `aria-checked`.
- `OptionRail`: carril con scroll, flechas, snap, teclado y detección de extremos. Acepta `centerActive` para el carrusel de emociones (la opción activa se centra) y lo desactiva en formatos (`scroll-snap-align: start`).
- `OptionGrid`: rejilla responsive de 2 columnas en móvil y hasta 4 en escritorio.
- `OptionSelector`: elige entre rejilla y carril y compone las piezas.

`FeelingsCarousel` pasa a ser una composición de `OptionRail` + `OptionButton` + buscador + `Medallion`; conserva su API pública y su comportamiento (activo centrado, Inicio/Fin, búsqueda). `OptionCarousel` se mantiene como alias delgado mientras existan llamadas, y se retira cuando todas usen `OptionSelector`.

**Alternativa descartada:** un componente con `renderOption` libre. Multiplica variantes y vuelve a dispersar el estilado que se quiere centralizar.

### 2. Formatos con icono

`src/components/selectors/formatOptions.tsx` centraliza el mapa:

| Formato | Icono | Etiqueta |
|---|---|---|
| `digital` | `HardDrive` | Digital |
| `vinyl` | `Disc3` | Vinilo |
| `cd` | `Disc` | CD |
| `cassette` | `CassetteTape` | Casete |
| `all` | `Library` | Toda la colección |

Las etiquetas reutilizan las claves de `quickRecommendation` (`vinyl`, `cd`, `cassette`, `anyFormat`) y se añade `formats.digital` si falta. El icono va con `aria-hidden="true"` y tamaño fijo; la etiqueta sigue siendo el nombre accesible. En los chips de resumen no se añaden iconos: la petición es para los botones de selección.

### 3. Recorte del carrusel

El carril nuevo aplica el mismo valor al padding del track y al `scroll-padding` del scrollport:

```css
.option-selector__rail {
  overflow-x: auto;
  scroll-padding-inline: var(--selector-gutter);
  scroll-snap-type: x proximity;
}
.option-selector__rail-track {
  padding-inline: var(--selector-gutter);
}
```

Se elimina el `margin` negativo del carril y se usa `scroll-snap-align: start` en formatos y `center` en emociones. Para el centrado del último elemento, `OptionRail` calcula el destino y lo limita a `scrollWidth - clientWidth`, de modo que el snap nunca deja el último botón fuera del área visible. El recorte vertical se mantiene con padding suficiente para el medallón activo.

Criterio de aceptación medible: al llegar a `scrollLeft` máximo, `lastOption.getBoundingClientRect().right <= rail.getBoundingClientRect().right - gutter + 1`, y su izquierda sigue dentro del rail. Se comprueba con Playwright a 320, 390, 768 y 1440 px.

### 4. Migración

| Sitio | Antes | Después |
|---|---|---|
| Inicio, emociones/actividades | `FeelingsCarousel` con estilos propios | `FeelingsCarousel` sobre `OptionRail`/`OptionButton` |
| Asistente, emociones | `MoodSelector` inline | `OptionSelector` con `Medallion` |
| Asistente, actividades | `OptionCarousel` | `OptionSelector` carousel |
| Asistente, formatos | botones `save-album-modal-option` | `OptionSelector` grid con iconos |
| Inicio, formatos (rápida y paso 2) | botones inline | `OptionSelector` grid con iconos |
| Filtro, formatos | emojis en grid | `OptionSelector` grid con iconos |

Los estilos específicos que sobrevivan (tamaño del medallón, etiqueta del carrusel de emociones) se mueven a modificadores `data-size`/`data-kind` del botón compartido. Se eliminan `.option-carousel*` y las reglas duplicadas de `.feeling-option` que ya cubra el botón común.

### 5. Accesibilidad

- Emociones: `role="listbox"` + `aria-multiselectable` y opciones `role="option"` + `aria-selected`.
- Actividades: `role="radiogroup"` y opciones `role="radio"` + `aria-checked`.
- Formatos: grupo de botones con `aria-pressed` (selección múltiple) y `aria-label` del grupo.
- Teclado: flechas, Inicio/Fin en carriles; Tab en rejillas; foco visible con `:focus-visible`.
- El buscador de emociones/actividades se conserva en `FeelingsCarousel` y no se añade a formatos.
- `useReducedMotion` decide si el scroll es suave o instantáneo.

## Risks / Trade-offs

- **Regresión del carrusel activo** → `FeelingsCarousel` mantiene sus tests visuales y de teclado; el centrado se prueba en los cuatro anchos.
- **CSS duplicado durante la migración** → se migran los seis sitios en un solo change y se eliminan las clases viejas al final.
- **Etiquetas de formato hardcodeadas** → se centralizan en i18n; si falta una clave, se añade sin cambiar el texto visible.
- **Iconos con tamaños distintos** → todos usan el mismo `size` y `strokeWidth`; el contenedor reserva el espacio.
- **Rejilla del filtro en móvil** → se mantiene 2 columnas y se comprueba que los iconos no parten la etiqueta.

## Migration Plan

Sin migración de datos. Despliegue normal; rollback revirtiendo el commit. No hay feature flag: el cambio es de presentación y conserva el comportamiento.

## Open Questions

- Ninguna abierta. El alcance excluye filtros de género, etiquetas y ordenación.
