# Proposal

## Why

La app tiene dos carruseles casi iguales (`FeelingsCarousel` y `OptionCarousel`) y tres formas distintas de pintar los formatos: emojis en el filtro, botones de texto en el asistente y botones con estilos inline en el inicio. El resultado es inconsistente, más caro de mantener y con un defecto visible: al llegar al final del carrusel el último elemento se corta antes del borde del contenedor. Además, los botones de formato no comunican visualmente qué representan.

## What Changes

- **Un sistema de selectores compartido** para emoción, actividad y formato: un mismo botón de opción, un mismo carril desplazable y una misma rejilla, con estados seleccionado, activo, foco y deshabilitado iguales en toda la app.
- **Iconos en los formatos**: digital, vinilo, CD y casete pasan a mostrar un icono junto a la etiqueta; la opción «toda la colección» usa un icono de biblioteca. El icono es decorativo y la etiqueta sigue siendo el nombre accesible.
- **Carrusel sin recorte prematuro**: al llegar al final, el último elemento se ve completo; el recorte ocurre solo en el borde del contenedor. Se revisa en 320–1440 px, en ambos temas y con teclado, arrastre y flechas.
- **Migración de los selectores existentes** de emoción/actividad y de formato al componente compartido, sin cambiar la selección, los roles, el teclado, el buscador ni el movimiento reducido.
- **Sin cambios de datos**: no se tocan la API, Firestore, los formatos canónicos ni el comportamiento de guardado.

## Capabilities

### New Capabilities

- `option-selectors`: comportamiento y presentación compartidos de los selectores de opción (emoción, actividad y formato), incluidos iconos, carrusel, rejilla, estados y accesibilidad.

### Modified Capabilities

Ninguna: los requisitos de recomendación, colección y recomendación rápida no cambian; solo se unifica su presentación.

## Impact

- Nuevos componentes y estilos en `src/components/selectors/` y `src/app/globals.css`.
- `src/components/FeelingsCarousel.tsx`, `src/components/MoodSelector.tsx`, `src/components/OptionCarousel.tsx`, `src/components/FilterModal.tsx`.
- `src/app/home/pages/StartPage.tsx`, `src/app/search/components/SelectedAlbumModal/steps/SaveAlbumActivitiesStep.tsx` y `SaveAlbumFormatStep.tsx`.
- Constantes de formato e iconos; sin dependencias nuevas (`lucide-react` ya está instalado).
- Traducciones ES/EN solo si algún texto visible cambia; los nombres de formato se conservan.
