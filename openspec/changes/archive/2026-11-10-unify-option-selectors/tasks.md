# Tasks

## 1. Coordinación

- [x] 1.1 Registrar la línea base con `npx tsc --noEmit`, `npm run lint` y `npm test`
- [x] 1.2 Verificar que `lucide-react` expone `Disc3`, `Disc`, `CassetteTape`, `HardDrive` y `Library`, y anotar que `CompactDisc` no existe en esta versión

## 2. Primitivas compartidas

- [x] 2.1 Crear `src/components/selectors/types.ts` con `OptionItem` y los tipos de selección, disposición y búsqueda
- [x] 2.2 Crear `src/components/selectors/OptionButton.tsx` con estados `data-selected`/`data-active`, icono o medallón, etiqueta, foco visible y semántica `aria-pressed` o `radio`
- [x] 2.3 Crear `src/components/selectors/OptionRail.tsx` con scroll, flechas, snap, detección de extremos, `centerActive` y respeto a `useReducedMotion`
- [x] 2.4 Crear `src/components/selectors/OptionGrid.tsx` con 2 columnas en móvil y hasta 4 en escritorio
- [x] 2.5 Crear `src/components/selectors/OptionSelector.tsx` que componga rejilla o carril, roles `listbox`/`radiogroup` y el buscador cuando se pase

## 3. Estilos y recorte

- [x] 3.1 Añadir a `src/app/globals.css` `.option-selector`, `.option-selector__grid`, `.option-selector__rail`, `.option-selector__rail-track`, `.option-selector__option` y `.option-selector__icon`, con tokens de tema
- [x] 3.2 Igualar `scroll-padding-inline` del carril y `padding-inline` del track, eliminar el `margin` negativo y fijar `scroll-snap-align: start` o `center` según el modo
- [x] 3.3 Limitar en `OptionRail` el destino del centrado a `scrollWidth - clientWidth` para que el último elemento no quede fuera
- [x] 3.4 Comprobar con Playwright que, a `scrollLeft` máximo, el borde derecho del último botón queda dentro del carril menos el gutter, a 320, 390, 768 y 1440 px
- [x] 3.5 Eliminar `.option-carousel*` y las reglas de `.feeling-option` que absorba el botón compartido, conservando solo los modificadores de medallón

## 4. Formatos

- [x] 4.1 Crear `src/components/selectors/formatOptions.tsx` con el mapa de formatos, iconos, etiquetas i18n y la opción `all`
- [x] 4.2 Añadir las claves de traducción que falten en `es.json`/`en.json` y documentarlas en `docs/TRADUCCIONES.md`
- [x] 4.3 Verificar que el icono es `aria-hidden` y que el nombre accesible de cada opción es su etiqueta

## 5. Migración de selectores

- [x] 5.1 Reescribir `FeelingsCarousel` sobre `OptionRail` + `OptionButton`, conservando buscador, activo centrado, Inicio/Fin, selección múltiple y animación escalonada
- [x] 5.2 Migrar `MoodSelector` a `OptionSelector` en sus variantes `grid` y `carousel`, con `Medallion` como icono
- [x] 5.3 Migrar `SaveAlbumActivitiesStep` a `OptionSelector` con selección única y `Medallion`
- [x] 5.4 Migrar `SaveAlbumFormatStep` a `OptionSelector` en rejilla, con iconos y selección múltiple
- [x] 5.5 Migrar los formatos de `StartPage` (recomendación rápida y paso de fuente) a `OptionSelector` con iconos
- [x] 5.6 Migrar los formatos de `FilterModal` a `OptionSelector` con iconos, conservando la selección múltiple y los filtros activos
- [x] 5.7 Retirar `OptionCarousel` o dejarlo como alias sin lógica propia cuando ya no queden llamadas directas

## 6. Verificación y regresión

- [x] 6.1 Recorrer emoción y actividad en el inicio y en el asistente: selección múltiple/única, buscador, teclado, Inicio/Fin y foco visible
- [x] 6.2 Recorrer los tres selectores de formato y comprobar iconos, etiquetas, selección y que el resumen y el guardado siguen recibiendo los mismos valores
- [x] 6.3 Revisar claro/oscuro a 320, 390, 768, 1440 y 1920 px sin scroll horizontal ni etiquetas partidas
- [x] 6.4 Confirmar que el carrusel corta solo en el borde del contenedor y que el último elemento se ve completo con arrastre, rueda y flechas
- [x] 6.5 Ejecutar `npx tsc --noEmit`, `npm run lint` y `npm test`; cuando el servidor de desarrollo esté parado, `npm run build`
- [x] 6.6 Validar el cambio con `npx openspec validate unify-option-selectors --strict`
