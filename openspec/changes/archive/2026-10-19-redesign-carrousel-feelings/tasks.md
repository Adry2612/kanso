# Tasks

## 1. Catálogo y marca compartida

- [x] 1.1 Añadir a `src/constants/moods.ts` y `src/constants/activities.ts` solo el metadato de marca que haga falta, sin tocar claves, etiquetas ni emoji; verificar que el catálogo sigue con 15 emociones y 9 actividades y que `npx tsc --noEmit` pasa
- [x] 1.2 Crear la pieza de **medallón** compartida (emoji del catálogo dentro de un contenedor con tokens, etiqueta legible y estado seleccionado/no seleccionado) y verificar que compila (`npx tsc --noEmit`) y que se ve sobre ambos temas
- [x] 1.3 Añadir a `src/app/globals.css` los estilos del medallón y las utilidades del carrusel reutilizando los tokens; verificar contraste AA de etiqueta y medallón en tema claro y oscuro

## 2. Carrusel interactivo

- [x] 2.1 Implementar el carrusel como carril `scroll-snap` con todas las opciones renderizadas, foco central y vecinos visibles; verificar que las 15 emociones y las 9 actividades quedan visibles y alcanzables
- [x] 2.2 Añadir la interacción con puntero (arrastre, rueda y flechas del carrusel); verificar el recorrido completo hasta el primer y el último elemento
- [x] 2.3 Añadir la navegación por teclado (flechas, Inicio/Fin, Espacio/Enter) y los roles/ARIA (`listbox`/`radiogroup`, `aria-checked`/`aria-pressed`) con nombre accesible; verificar con tabulador y lector de pantalla
- [x] 2.4 Asegurar objetivos táctiles ≥ 44 px y ausencia de rotación automática; verificar en viewport móvil y comprobando que el carrusel no avanza solo
- [x] 2.5 Integrar la entrada escalonada y el feedback táctil con las primitivas de `src/components/motion`; verificar que todo se muestra estático con `prefers-reduced-motion: reduce`

## 3. Integración en el inicio

- [x] 3.1 Sustituir en `src/app/home/pages/StartPage.tsx` la pestaña + rejilla por el carrusel como decisión principal, conservando el conmutador Emoción/Actividad; verificar que `/home` renderiza el carrusel
- [x] 3.2 Conectar la selección del carrusel con el paso de formato/etiquetas y la navegación a `/recommendation`; verificar una recomendación por emoción y otra por actividad de principio a fin
- [x] 3.3 Conservar los estados existentes (continuar deshabilitado sin selección, selección mostrada) y la recomendación rápida subordinada; verificar ambos casos en el navegador

## 4. Marca unificada en filtro y modal

- [x] 4.1 Usar el medallón compartido en `src/components/FilterModal.tsx`; verificar que muestra la misma marca que el inicio y que el estado seleccionado respeta los filtros
- [x] 4.2 Usar la marca compartida en `src/app/search/components/SelectedAlbumModal/steps/SaveAlbumModal.tsx` y `src/components/MoodBubble.tsx`; verificar que el guardado de un álbum conserva sus claves y su etiqueta traducida
- [x] 4.3 Retirar de `src/components/MoodSelector.tsx` la rama muerta con flechas/rueda/puntos paginados; verificar que no queda paginación y que `npx tsc --noEmit` y `npm run lint` pasan

## 5. Verificación de integración

- [x] 5.1 Ejecutar `npx tsc --noEmit`, `npm run lint` y `npm run build` sin errores
- [x] 5.2 Comprobar que la misma marca aparece en inicio, filtro y modal, y que las 15 emociones + 9 actividades son alcanzables por puntero y por teclado en ambos temas
- [x] 5.3 Reservar la revisión visual del usuario antes de archivar (la vuelta anterior se rechazó aquí)

## 6. Ajustes de la revisión visual

- [x] 6.1 Bajar las flechas del carrusel bajo el carril y agruparlas (`feelings-carousel__footer`), sin que tapen opciones; verificado en 768, 1024 y 1440 px, y el pie queda siempre bajo el carril
- [x] 6.2 Alinear las etiquetas con nombres largos: dos líneas reservadas y recorte a dos líneas (`-webkit-line-clamp`), con el medallón siempre en la misma línea base; verificado que las 15 opciones comparten `offsetTop` de medallón y etiqueta y la misma altura (118 px)
- [x] 6.3 Añadir buscador por texto (lupa) que filtre emociones y actividades ignorando acentos y mayúsculas, con recuento visible y anunciado, estado vacío y limpieza sin perder la selección; verificado con "relajacion" → Relajación y con "an" → Melancolía/Ansiedad
- [x] 6.4 Traducir los textos nuevos (`feelingsCarousel`) en `es` y `en`
- [x] 6.5 Verificar teclado y lector: la lupa se abre con Enter, `Escape` limpia y luego cierra, y el foco permanece en el buscador al filtrar
- [x] 6.6 Verificar que los controles miden 44×44 px y que el pie no desborda el panel, con el carrusel en ambos temas

## 7. Ajustes de colocación (segunda revisión visual)

- [x] 7.1 Centrar la pareja de flechas bajo el carril (`feelings-carousel__footer` con `justify-content: center`); verificado que el punto medio de la pareja coincide con el del carril
- [x] 7.2 Mover la lupa a la fila del conmutador Emoción/Actividad, alineada a la derecha y por encima del carril; el buscador se despliega justo debajo del conmutador
- [x] 7.3 Llevar el botón de recomendación rápida a la derecha del título y desplegar su panel justo bajo la cabecera (antes vivía en una sección aparte debajo del panel), visible solo en el paso 1
- [x] 7.4 Pasar el buscador a controlado (`search.open` / `onOpenChange`): la lupa vive fuera del carrusel y este solo pinta el campo, con `hidden` cuando está cerrado para no romper `aria-controls`
- [x] 7.5 Verificar el filtrado en emociones y actividades, la alineación y las flechas centradas tras el cambio de estructura


## Notas de implementación

- **Contención del carril.** El track del carrusel propaga su `min-content` a los grid items (que por defecto tienen `min-width: auto`), así que el panel crecía en lugar de dejar scroll: la página desbordaba por la derecha y el carrusel aparecía cortado. Se corrige con `min-w-0` en los items de la rejilla de inicio y `min-width: 0` / `width: 100%` en `.feelings-carousel` y `.feelings-rail`.
- **La activa manda sobre el re-sincronizado.** El centrado por teclado no puede centrar del todo el primer/último elemento, así que el sincronizado de scroll devolvía la activa al vecino. Ahora el carril solo re-sincroniza la activa con scroll **del usuario** (rueda, touch, arrastre) y un movimiento explícito de foco/tecla lo anula.

## Fuera de alcance

- Cambiar las claves del catálogo o su número (requiere migración de datos).
- Tocar la lógica de recomendación, el historial o los filtros de formato/etiquetas.

## Workflow follow-up

- ~~Resolver el solape con el change pausado `redesign-mood-picker`~~ → resuelto: cerrado el 2026-10-19 y su feedback absorbido en `design.md`.
- Archivar el change cuando se cumplan los requisitos de revisión del proyecto.
- Verificar el resultado archivado.

## Hallazgo ajeno a este change

- **Desborde horizontal por debajo de ~900 px**: `.app-content` mantiene `margin-left: 230px` aunque el sidebar no se superpone, así que en móvil la página desborda (medido: 487 px de ancho en `/favorites`, que no tiene carrusel). Es del armazón, no del carrusel, y necesita su propio change. La pareja de flechas ya envuelve en paneles muy estrechos para no añadir un segundo desborde.
