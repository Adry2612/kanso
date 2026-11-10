# Tasks

## 1. Coordinación y línea base

- [x] 1.1 Registrar la línea base con `npx tsc --noEmit`, `npm run lint` y `npm run build` antes de tocar la rejilla, para no confundir fallos previos con regresiones de este cambio
- [x] 1.2 Confirmar que `collection-experience`, `collection-ui-polish` y `polish-ultrawide-mobile-and-collection` siguen activos y que el orden de archivo queda anotado en `design.md`; verificar que `openspec validate refine-grid-and-quick-recommendation --strict` sigue pasando

## 2. Rejilla con tarjetas de tamaño estable

- [x] 2.1 Añadir `.kanso-album-grid` en `src/app/globals.css` con dos columnas por debajo de 768 px y `repeat(auto-fill, minmax(300px, 320px))` centrado desde 768 px, con los gaps actuales de colección e historial; verificar con `npm run build` que la clase compila
- [x] 2.2 Aplicar `.kanso-album-grid` a las cuadrículas de «Colección» y «Por escuchar» en `src/app/collection/page.tsx` y a `GallerySkeleton`; verificar a 390, 768 y 1440 px que hay 2, 2 y 3 columnas y que las tarjetas miden 300–320 px
- [x] 2.3 Aplicar `.kanso-album-grid` a la cuadrícula del historial en `src/app/recomendationHistory/page.tsx`; verificar a 1920 y 2400 px con entradas suficientes que se añaden columnas y la tarjeta no baja de 300 px
- [x] 2.4 Revisar la cuadrícula con 1, 2 y 5 álbumes en escritorio ancho, comprobando que el sobrante se centra, que la última fila no queda pegada a la izquierda y que no aparece desplazamiento horizontal

## 3. Ancho máximo en pantallas grandes

- [x] 3.1 Ajustar los tramos de `--page-max` en `src/app/globals.css` a 1440 / 1600 / 2080 / 2400 px; verificar a 1600, 1920, 2400, 2560 y 3440 px que el contenido se centra, no hay scroll horizontal y los márgenes laterales bajan respecto al estado actual
- [x] 3.2 Revisar inicio, ficha de álbum, búsqueda, artistas, novedades y ajustes a 2400 px, comprobando que los párrafos y títulos conservan sus `max-w` y no se estiran de borde a borde

## 4. Filtros de la recomendación rápida

- [x] 4.1 Añadir `quick=1` en `buildQuickRecommendationHref` y leerlo en `src/app/recommendation/page.tsx` para pasar `isQuick` a `RecomendationPage`; verificar que el enlace de Inicio lo incluye y que el flujo por emoción o actividad no lo incluye
- [x] 4.2 Crear `RecommendationFilterSummary` con el formato y un chip por etiqueta (`Categoría: valor`), reutilizando `quickRecommendation.*`, `tagCategoryI18nKey` y `tags.categories.*`, y añadir la clave `quickRecommendation.filtersLabel` en `es.json` y `en.json`; verificar los casos solo formato, solo etiqueta, ambos y ninguno
- [x] 4.3 Integrar el resumen en `RecomendationPage` justo después de «Volver» y antes de la portada, solo cuando `isQuick`; verificar a 320 y 390 px que los chips envuelven sin desbordar y que el flujo por emoción o actividad no lo muestra
- [x] 4.4 Documentar la nueva clave en `docs/TRADUCCIONES.md` y actualizar `README.md` si describe la recomendación rápida; verificar que lo escrito coincide con la interfaz

## 5. Integración y regresión

- [x] 5.1 Ejecutar `npx tsc --noEmit`, `npm run lint` y `npm run build` y comprobar que terminan sin errores nuevos
- [x] 5.2 Recorrer colección, historial y resultado de recomendación rápida a 320, 390, 768, 1440, 1920, 2400, 2560 y 3440 px en tema claro y oscuro, verificando el tamaño de tarjeta, el centrado, los chips y la ausencia de scroll horizontal
- [x] 5.3 Validar los cuatro cambios implicados con `openspec validate <cambio> --strict` y comprobar que los deltas siguen siendo coherentes con lo implementado

## Workflow follow-up

- Archivar en orden: `collection-experience`, `collection-ui-polish`, `polish-ultrawide-mobile-and-collection` y, por último, `refine-grid-and-quick-recommendation`.
- Verificar que las specs principales recogen los deltas y que `adaptive-layout` mantiene el ancho y las rejillas acordados.
