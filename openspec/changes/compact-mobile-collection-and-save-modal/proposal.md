# Proposal

## Why

En pantallas estrechas, la colección y el asistente de guardado concentran más información de la que cabe con comodidad: las tarjetas apilan emociones, contador y acción sobre una portada ya oscurecida por el velo inferior, la cabecera y los filtros empujan los discos fuera de la primera pantalla, el paso de formato obliga a desplazarse para completar lo esencial y la confirmación de éxito recorta el contenido y deja las acciones fuera de la vista. El resultado es una experiencia que se siente apretada y, en el caso del modal de éxito, directamente rota.

## What Changes

- **Asistente de guardado sin scroll para lo esencial.** En móvil el asistente pasa a ser una hoja inferior ajustada al contenido, con una tarjeta de identidad del álbum. Desde tablet y en escritorio se presenta en horizontal, con la foto del artista a la izquierda y el formulario a la derecha. El paso 3 agrupa «Formato» e «Idioma y género» en dos pestañas del mismo paso, con el pie siempre igual («Atrás» y «Guardar»). Con eso, todos los pasos caben sin desplazarse, incluida la sección de idioma y género.
- **Modal de éxito sin recortes.** La confirmación usa la misma hoja inferior y se ajusta a su contenido: el mensaje y las emociones relacionadas se ven completos en un móvil estándar y las acciones quedan siempre visibles.
- **Tarjetas de colección legibles en móvil.** Sobre la portada queda una sola emoción y el contador «+N»; el velo inferior se suaviza y la acción de escuchar se mantiene discreta en la esquina. El resto de emociones se consulta en la ficha del álbum y en la vista de lista.
- **Cabecera y filtros compactos en móvil.** El encabezado de la colección, las estadísticas y el bloque de búsqueda/orden/filtro reducen su altura, y los filtros de emoción pasan a una sola fila desplazable en lugar de ocupar tres filas antes de los discos.
- **Una sola gramática de densidad móvil.** Los ajustes se aplican con los breakpoints y tokens existentes, sin cambiar la composición de escritorio ni duplicar componentes.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `modal-experience`: el shell garantiza que el contenido de un modal no se recorte, que el cuerpo sea la única región desplazable y que el asistente de guardado estructure el paso de formato con un bloque plegable para idioma y género.
- `album-collection`: las tarjetas de la cuadrícula limitan la información superpuesta a la portada en pantallas estrechas y el encabezado y los filtros de emoción se compactan para mostrar antes los discos.
- `mobile-viewport`: los modales y la colección aprovechan la altura visible en pantallas estrechas, sin recortes ni desplazamientos innecesarios para ver lo esencial.

## Impact

- **Asistente de guardado:** `src/app/search/components/SelectedAlbumModal/steps/SaveAlbumModal.tsx`, `SaveAlbumFormatStep.tsx`, `SaveAlbumStepper.tsx`, `src/components/ModalShell.tsx` y el bloque de estilos del modal en `src/app/globals.css`.
- **Confirmación de éxito:** `SuccessAlbumModal.tsx` y las clases `album-art-modal-*` / `modal-shell-*` de `globals.css`.
- **Colección:** `src/app/collection/page.tsx`, `src/app/collection/components/CollectionHeader.tsx`, `CollectionMoodChips.tsx` y `src/components/gallery/GalleryCard.tsx` / `src/components/AlbumCover.tsx` para el velo y los badges superpuestos.
- **Textos:** nuevas claves en `src/locales/es.json` y `src/locales/en.json` para el bloque plegable de idioma y género y su control de apertura.
- **Sin cambios** en API, Firestore, algoritmo de recomendaciones ni dependencias nuevas.

## Fuera de alcance

- Rediseñar la ficha de álbum, la búsqueda o el inicio más allá de los ajustes de densidad descritos.
- Cambiar qué emociones, actividades, formatos o etiquetas se guardan, o el orden de los pasos del asistente.
- Añadir nuevos filtros, ordenaciones o vistas de la colección.
- Ocultar la barra del navegador, que depende del modo instalado y no del layout.
