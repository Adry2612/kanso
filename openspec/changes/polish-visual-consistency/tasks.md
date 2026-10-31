# Tasks

## 1. Coordinación y línea base

- [x] 1.1 Registrar la línea base con `npx tsc --noEmit`, `npm run lint` y `npm run build` antes de tocar componentes, para no confundir fallos previos con regresiones de este cambio
- [x] 1.2 Confirmar que `polish-ultrawide-mobile-and-collection` y `refine-grid-and-quick-recommendation` siguen activos y que este cambio no modifica sus requisitos; verificar que `npx openspec validate polish-visual-consistency --strict` sigue pasando

## 2. Portada compartida

- [x] 2.1 Crear `src/components/AlbumCover.tsx` con marco cuadrado, borde, fondo, degradado inferior, carga diferida, zoom en `group-hover`, icono `Music2` de reserva y `className` para tamaños compactos; verificar con `npx tsc --noEmit`
- [x] 2.2 Sustituir el marcado de portada de `src/components/gallery/GalleryCard.tsx` y `GalleryRow.tsx` por `AlbumCover`, conservando sus tamaños y acciones; verificar colección e historial en cuadrícula y lista a 390 y 1440 px
- [x] 2.3 Añadir a `src/components/AlbumCard.tsx` un slot opcional `footer`, sustituir su imagen por `AlbumCover` y comprobar que artistas y biblioteca compartida no cambian de estructura; el buscador recibe su composición definitiva en 2.7. Verificar con `npx tsc --noEmit` y a 390 y 1440 px
- [x] 2.4 Sustituir la portada de `src/components/SharedAlbumCard.tsx` por `AlbumCover`; verificar la biblioteca compartida en tema claro y oscuro
- [x] 2.5 Reutilizar `AlbumCard` en `src/app/releases/page.tsx` con `onClick` y `footer` para tipo y fecha, eliminando el `article` y el `cursor-pointer` duplicados; verificar agrupación por mes y apertura del detalle
- [x] 2.6 Verificar que buscador, novedades, colección, historial y biblioteca compartida muestran el mismo marco de portada y que un álbum sin imagen conserva el tamaño con el icono de reserva
- [x] 2.7 Añadir a `AlbumCard` una variante sin panel ni elevación para las dos rejillas del buscador (resultados y «Añadidos por la comunidad»), conservando el bloque de texto, el botón de añadir y los estados de colección/pendientes; ajustar `AlbumGridSkeleton` a la misma composición y verificar con `npx tsc --noEmit`
- [x] 2.8 Verificar a 390 y 1440 px, en tema claro y oscuro, que las tarjetas del buscador no muestran marco doble ni se elevan al pasar el puntero, que solo se amplía la imagen y que el botón de añadir y los estados siguen visibles

## 3. Orden de las cápsulas de emoción

- [x] 3.1 Añadir `prioritizeMoods` a `src/utils/collection.ts` con partición estable (filtradas primero, resto en orden original) y comprobarla con datos sintéticos: sin filtro, una filtrada fuera del límite, varias filtradas y duplicados normalizados
- [x] 3.2 Aplicar `prioritizeMoods` en `moodBadges` y `moodBadgesInline` de `src/app/collection/page.tsx`, mostrando `slice(0, max)` de la lista priorizada y calculando el `+N` solo con las no visibles; verificar cuadrícula (2) y lista (3) con la emoción filtrada fuera del límite
- [x] 3.3 Verificar con una emoción, varias y ninguna que las cápsulas filtradas aparecen primero, conservan su remarcado y el contador `+N` coincide con las ocultas

## 4. Estados vacíos centrados

- [x] 4.1 Añadir la clase `.kanso-empty` en `src/app/globals.css` (ancho completo, `margin-inline: auto`, ancho máximo legible y texto centrado) y comprobar que compila con `npm run build`
- [x] 4.2 Centrar los dos estados vacíos de `src/app/recomendationHistory/page.tsx` (sin historial y sin coincidencias) sin cambiar su contenido ni sus acciones; verificar a 320, 768 y 2400 px
- [x] 4.3 Centrar los estados vacíos de `src/app/releases/page.tsx` y `src/app/artists/page.tsx` (sin resultados y sin artistas seguidos), conservando sus textos y acciones; verificar en ambos temas
- [x] 4.4 Centrar el estado sin resultados y el panel previo a la consulta de `src/app/search/page.tsx`, manteniendo las sugerencias y sus chips alineados al centro; verificar que sin consulta y sin resultados no hay desborde horizontal
- [x] 4.5 Centrar dentro de su tarjeta lateral el estado vacío de recientes en `src/app/home/pages/StartPage.tsx`; verificar el inicio con y sin recomendaciones
- [x] 4.6 Recorrer los estados vacíos de historial, novedades, artistas, buscador e inicio a 320, 390, 768, 1440 y 2400 px en tema claro y oscuro, confirmando centrado, ancho legible y ausencia de scroll horizontal
- [x] 4.7 Centrar los vacíos restantes detectados en la revisión: «Añadidos por la comunidad» del buscador, solicitudes de amistad, biblioteca compartida y muestra pública de álbumes; verificar que no queda ningún estado vacío alineado a la izquierda

## 5. Historial alineado a la izquierda

- [x] 5.1 Añadir la variante `.kanso-album-grid--start` en `src/app/globals.css` que fije `justify-content: start` desde 768 px, sin alterar `.kanso-album-grid`
- [x] 5.2 Aplicar la variante solo al `Stagger` de la cuadrícula del historial en `src/app/recomendationHistory/page.tsx`; verificar con 1, 2 y 5 entradas a 1440, 1920 y 2400 px que las tarjetas empiezan a la izquierda y el sobrante queda a la derecha
- [x] 5.3 Confirmar que la colección mantiene su cuadrícula centrada y que la vista de lista del historial y su esqueleto de carga no cambian

## 6. Cursor de interacción

- [x] 6.1 Añadir a `src/app/globals.css` la regla base de `cursor: pointer` para botones habilitados, `[role="button"]` y `summary`, y `cursor: not-allowed` para deshabilitados y `aria-disabled="true"`; verificar que el orden de las reglas deja ganar a la de deshabilitados
- [x] 6.2 Auditar los elementos clicables que no son botones ni enlaces (`AlbumCard`, novedades, tarjetas y filas) y confirmar que todos muestran puntero; corregir cualquier `role="button"` sin interacción real
- [x] 6.3 Verificar en navegador que botones, enlaces, chips, pestañas, tarjetas, controles deshabilitados y el menú muestran el cursor correcto, y que el foco de teclado y su indicador no cambian

## 7. Integración y regresión

- [ ] 7.1 Ejecutar `npx tsc --noEmit`, `npm run lint` y `npm run build` y comprobar que terminan sin errores nuevos
- [x] 7.2 Recorrer buscador, novedades, colección, historial, artistas, biblioteca compartida e inicio a 320, 390, 768, 1440, 1920 y 2400 px en tema claro y oscuro, verificando portadas, composición del buscador, cápsulas, vacíos, alineación y cursor
- [x] 7.3 Validar el cambio con `openspec validate polish-visual-consistency --strict` y comprobar que los deltas no contradicen `polish-ultrawide-mobile-and-collection` ni `refine-grid-and-quick-recommendation`

## Workflow follow-up

- Archivar después de los cambios en curso con los que comparte capacidades, o en cualquier orden, porque los nuevos requisitos son aditivos.
- Al archivar, revisar que `album-collection`, `recommendations` y `accessibility` recogen los requisitos nuevos sin duplicar los ya existentes.
