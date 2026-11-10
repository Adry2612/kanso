# Tasks

## 1. Contrato de scroll del modal

- [x] 1.1 Añadir `.modal-shell-scroll` en `src/app/globals.css` (`min-height: 0`, `flex: 1 1 auto`, `overflow-y: auto`, `overscroll-behavior: contain`) y usarla en el cuerpo de `SuccessAlbumModal`; verificar a 390 × 844 px que las cápsulas de emoción no se cortan, que las acciones y el bloque de deshacer quedan visibles y que solo se desplaza el cuerpo.
- [x] 1.2 Aplicar la misma región desplazable al cuerpo de `SaveAlbumModal` manteniendo fuera del scroll el error, las acciones y el cierre; verificar con el bloque de idioma y género desplegado que el panel no crece, el cuerpo se desplaza y el botón de guardar sigue alcanzable sin desplazar el panel.
- [x] 1.3 Confirmar que no aparece un segundo scroll: recorrer con la rueda y con gesto táctil por encima del panel y del fondo, verificando que la página de detrás no se mueve y que en pantallas cortas (`data-visual-viewport="short"`) sigue habiendo una única región desplazable.

## 2. Cabecera compacta y paso de formato plegable

- [x] 2.1 Convertir el asistente en una hoja inferior móvil ajustada al contenido (`mobileSheet` en `ModalShell`), con tarjeta de identidad (portada de 56 px, título y artista), barra de arrastre y máximo de `92dvh`; verificar en 390 × 650 que la hoja mide lo que mide el contenido.
- [x] 2.2 Sustituir en móvil el stepper de etiquetas por tres barras de progreso con texto `sr-only` y `aria-current`, devolviendo las etiquetas desde `sm`; verificar con teclado y lector de pantalla que se anuncia el paso actual y que el indicador no repite etiquetas visibles.
- [x] 2.3 Reestructurar `SaveAlbumFormatStep` con un selector segmentado «Formato» / «Idioma y género» que resuma el estado de cada sección; verificar en 390 × 650 y 320 × 568 que el selector, título y cuatro formatos caben sin scroll y que se puede guardar solo con formatos.
- [x] 2.4 Cambiar entre las secciones, elegir idioma y género, volver a formato y regresar; verificar que la selección persiste, que el pie sigue mostrando «Atrás» y «Guardar» y que los resúmenes de las pestañas se actualizan sin recargar el paso.
- [x] 2.5 Añadir la clave de traducción del estado vacío del resumen en `src/locales/es.json` y `src/locales/en.json` y documentarla en `docs/TRADUCCIONES.md`; verificar que ambas lenguas tienen las mismas claves y que el texto nuevo no queda hardcodeado.
- [x] 2.6 Componer el modal en horizontal desde 768 px (`grid` de dos columnas) con la foto del artista a la izquierda y el formulario a la derecha; verificar en 800 × 700 y 1280 × 800 que la imagen se ve y que pasos, idioma/género y confirmación no necesitan scroll.

## 3. Confirmación de guardado sin recortes

- [x] 3.1 Comprobar la confirmación como hoja inferior: guardado normal, edición y destino pendientes, con cero, una y seis emociones; verificar que en 390 × 650 el mensaje, las emociones y las acciones se ven completos sin scroll y que en pantallas menores solo se desplaza el cuerpo.
- [x] 3.2 Verificar la confirmación en tema claro y oscuro a 320, 390 y 768 px, y con el teclado abierto, comprobando que el fondo no se desplaza y que el cierre y «Deshacer» siguen operativos.

## 4. Portada y tarjetas de la colección

- [x] 4.1 Quitar el degradado permanente de `AlbumCover` y añadir el prop `scrim` (`none` por defecto, `soft` para contenido superpuesto); verificar que la ficha del álbum, la búsqueda y las tarjetas compartidas muestran la portada sin velo y que la cuadrícula conserva contraste bajo las cápsulas.
- [x] 4.2 Limitar los badges de `GalleryCard` a una emoción más el contador por debajo de 640 px y a dos desde 640 px, con los dos juegos resueltos por CSS (`sm:hidden` / `hidden sm:flex`); verificar con uno, dos y tres o más emociones en 320, 390 y 768 px que el contador cuadra y que la portada se reconoce.
- [x] 4.3 Añadir al contador el texto accesible de emociones restantes y comprobar con lector de pantalla que anuncia la emoción visible y cuántas más hay, sin leer el juego de badges oculto.
- [x] 4.4 Verificar que la emoción filtrada sigue apareciendo en la tarjeta móvil cuando el álbum tiene varias, y que abrir la ficha o cambiar a la vista de lista muestra todas las emociones.
- [x] 4.5 Añadir a `OptionRail` un desvanecido en los bordes con contenido (según `canScrollLeft`/`canScrollRight`) para que los carriles de emociones, actividades e idioma/género no corten una tarjeta a media; verificar en inicio a 1280 px y en el asistente a 390 px.
- [x] 4.6 Centrar la opción elegida en los carriles de selección única y añadir `min-width: 0` a las columnas de idioma y género; verificar a 390 y 1280 px que el género seleccionado se ve, los controles del carril quedan dentro del modal y no hay desbordamiento horizontal.

## 5. Densidad del encabezado y filtros de la colección

- [x] 5.1 Compactar con utilidades responsive el título, subtítulo, estadísticas, pestañas y bloque de búsqueda/orden/filtro/vista; verificar a 390 × 844 que la primera fila de discos entra en la vista inicial y que escritorio conserva el ritmo actual.
- [x] 5.2 Convertir los chips de emoción en una sola fila desplazable en móvil («Todas» primero, `snap`, sin barra visible y con pista lateral) manteniendo la envoltura desde `sm`; verificar a 320 y 390 px que se alcanza cada emoción, que el foco no queda recortado y que no aparece scroll horizontal en la página.
- [x] 5.3 Revisar la densidad con la colección vacía, con el aviso de datos incompletos y en la pestaña de pendientes; verificar que los recortes no rompen esos estados ni dejan controles solapados.

## 6. Integración y regresión

- [x] 6.1 Ejecutar `npx tsc --noEmit`, `npm run lint`, `npm test` y `npm run build` y verificar que terminan sin errores nuevos.
- [x] 6.2 Recorrer colección, asistente de guardado y confirmación a 320, 390, 800, 1280 y 1440 px en ambos temas, con vista de cuadrícula y lista, verificando que no hay recortes, scroll horizontal ni dobles scrolls y que la foto del artista se ve desde 768 px.
- [x] 6.3 Repasar los escenarios de `specs/modal-experience`, `specs/album-collection` y `specs/mobile-viewport` en el navegador y anotar cualquier desviación antes de archivar.
