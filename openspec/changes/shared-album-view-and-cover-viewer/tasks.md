# Tasks

## 1. Coordinación y línea base

- [x] 1.1 Registrar la línea base con `npx tsc --noEmit` y `npm run lint`; si hace falta `npm run build`, parar antes el servidor de desarrollo para no compartir `.next` y anotar el resultado
- [x] 1.2 Confirmar que `src/components/AlbumCover.tsx` existe y que el cambio `polish-visual-consistency` sigue activo; verificar que este cambio no depende de sus requisitos de spec, solo del componente

## 2. Fondo compartido

- [x] 2.1 Extraer el cálculo de color de `useAlbumDetail` a un hook `useAlbumBackdrop` con el color por defecto actual y úsalo en el detalle sin cambiar el degradado; verificar con `npx tsc --noEmit` y comparar el fondo del detalle antes y después

## 3. Ficha compartida

- [x] 3.1 Crear `src/components/album/AlbumShowcase.tsx` con fondo derivado, volver, portada clicable, título, artistas, descripción, acciones, `meta`, `aboveHero`, tracklist y `aside`; verificar con `npx tsc --noEmit`
- [x] 3.2 Añadir a `src/locales/es.json` y `src/locales/en.json` las claves del visor (`album.viewCover`, `album.closeCover`) y comprobar que el build resuelve las traducciones

## 4. Detalle de álbum

- [x] 4.1 Migrar `src/app/albums/[albumId]/page.tsx` a `AlbumShowcase`, conservando las acciones de colección, el panel de datos guardados, el estado de pendientes y el modal de guardado; verificar con `npx tsc --noEmit`
- [x] 4.2 Comprobar que el detalle mantiene su estado de carga, su error y su navegación de vuelta, y que la portada conserva la transición de vista y el fondo dinámico

## 5. Recomendación

- [x] 5.1 Migrar `src/app/home/pages/RecomendationPage.tsx` a `AlbumShowcase`, pasando resumen de filtros, emociones recomendadas, descripción contextual y Spotify; verificar que no muestra acciones de colección ni panel de datos
- [x] 5.2 Sustituir el tracklist inline por `AlbumTracklist` con `tracks` y `loading`, eliminando el skeleton y el mensaje duplicados; verificar con álbum con pistas, sin pistas y en carga
- [x] 5.3 Comprobar que la recomendación conserva sus estados de carga, error y sin coincidencias sin adoptar la ficha de un álbum inexistente

## 6. Visor de portada

- [x] 6.1 Crear `src/components/album/CoverViewer.tsx` con apertura animada, `layoutId` o escala equivalente, fondo oscuro, `role="dialog"`, foco atrapado, `Esc`, clic fuera, botón de cierre y retorno del foco; verificar con `npx tsc --noEmit`
- [x] 6.2 Sustituir el arrastre del visor por un paralaje sutil al hover: la portada ampliada no se arrastra ni se mueve con clic, pero al pasar el puntero se desplaza unos píxeles hacia la dirección del ratón y vuelve a su posición al salir, manteniéndose fija; verificar con ratón que no hay arrastre y que el paralaje responde al hover
- [x] 6.3 Conectar la portada clicable de `AlbumShowcase` con el visor y verificar que se abre desde detalle y recomendación, que solo muestra la portada y el cierre, y que respeta `prefers-reduced-motion`
- [x] 6.4 Sustituir el zoom de hover de la portada que abre el visor por un brillo tenue y comprobar que al pasar el puntero no gira, no se inclina ni se desplaza
- [x] 6.5 Añadir el brillo de hover (sombra y degradado radial de baja opacidad) que sigue al puntero, se intensifica con el movimiento y vuelve al salir; verificar en tema claro y oscuro y con `prefers-reduced-motion`

## 7. Integración y regresión

- [ ] 7.1 Ejecutar `npx tsc --noEmit`, `npm run lint` y `npm run build` con el servidor de desarrollo parado, y comprobar que no hay errores nuevos
- [x] 7.2 Recorrer detalle y recomendación a 320, 390, 768, 1440, 1920 y 2400 px en tema claro y oscuro, verificando ficha, fondo, tracklist, visor, paralaje al hover, brillo, ausencia de giro en hover, cierre y foco
- [x] 7.3 Validar el cambio con `npx openspec validate shared-album-view-and-cover-viewer --strict` y comprobar que el delta de `recommendations` no contradice los cambios en curso

## Workflow follow-up

- Archivar después de `polish-visual-consistency` o asegurar que `AlbumCover` permanece en el árbol; este cambio no modifica la spec `album-artwork`.
- Al archivar, revisar que la ficha compartida y el visor no dejan requisitos duplicados en `album-detail` ni en `recommendations`.
- El estilado de la tarjeta de resultados del buscador se revisa en `polish-visual-consistency`; este cambio solo cubre la ficha y el visor.
