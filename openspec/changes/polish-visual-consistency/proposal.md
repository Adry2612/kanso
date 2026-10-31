# Proposal

## Why

La interfaz ha ido acumulando pequeñas incoherencias visuales entre pantallas: las portadas se dibujan con marcos distintos, los estados vacíos quedan pegados a la izquierda, la cuadrícula del historial se centra cuando debería empezar por la izquierda y muchos controles no muestran el cursor de interacción. Además, al filtrar la colección por emoción, las cápsulas resaltadas quedan dispersas y pueden caer fuera del límite visible de la tarjeta, de modo que el filtro activo se percibe peor de lo que debería. El buscador, además, conserva una tarjeta con panel y elevación que no coincide con la composición de la colección y el historial.

## What Changes

- **Orden de las cápsulas de emoción**: cuando el filtro rápido de emoción está activo, las emociones coincidentes se muestran primero en la lista de cápsulas de cada álbum, conservando el orden del resto y recalculando el contador `+N` solo con las no visibles. Aplica a la vista de cuadrícula y a la de lista.
- **Portada compartida**: extraer el marco de portada de `GalleryCard`/`GalleryRow` a un componente reutilizable y usarlo también en las tarjetas del buscador (`AlbumCard`) y de novedades, unificando radio, borde, fondo, degradado y zoom al pasar el puntero. En el buscador, la tarjeta de resultados pasa a la composición de colección e historial: la portada es la pieza principal, sin panel envolvente ni elevación de la tarjeta, y el zoom se limita a la imagen. Cada tarjeta conserva sus acciones propias (añadir, escuchar, tipo de lanzamiento).
- **Cursor de interacción**: aplicar `cursor: pointer` a todos los elementos interactivos (botones nativos, elementos con `role="button"` y contenedores clicables) y `cursor: not-allowed` a los deshabilitados, mediante una regla base y los ajustes puntuales necesarios.
- **Estados vacíos centrados**: centrar horizontalmente en el área de contenido los estados vacíos de historial (sin historial y sin coincidencias), novedades, artistas (sin resultados y sin artistas seguidos), buscador (sin resultados y panel previo a la consulta) e inicio (recomendaciones recientes), con ancho máximo legible y sin desplazamiento horizontal en móvil.
- **Historial alineado a la izquierda**: la cuadrícula del historial deja de centrar las tarjetas y alinea las filas al inicio del contenido, manteniendo la colección con su centrado actual.

## Capabilities

### New Capabilities

- `album-artwork`: presentación única de las portadas de álbum en toda la aplicación mediante un componente compartido.
- `empty-state-layout`: centrado y presentación coherente de los estados vacíos en las pantallas de la aplicación.

### Modified Capabilities

- `album-collection`: prioridad de las emociones filtradas dentro de las cápsulas de cada álbum.
- `recommendations`: alineación a la izquierda de la cuadrícula del historial de recomendaciones.
- `accessibility`: afordancia visual de los elementos interactivos mediante el cursor adecuado.

## Impact

- Componentes: `src/components/gallery/GalleryCard.tsx`, `GalleryRow.tsx`, `src/components/AlbumCard.tsx`, `src/components/SharedAlbumCard.tsx`, `src/app/releases/page.tsx`, además de un nuevo componente de portada compartido.
- Colección: `src/app/collection/page.tsx` (orden de cápsulas y contador `+N`).
- Estados vacíos: `src/app/recomendationHistory/page.tsx`, `src/app/releases/page.tsx`, `src/app/artists/page.tsx`, `src/app/search/page.tsx`, `src/app/home/pages/StartPage.tsx`.
- Buscador: composición de las tarjetas de resultados y del bloque «Añadidos por la comunidad», incluido su esqueleto de carga.
- Estilos: `src/app/globals.css` (cursor base, variante de rejilla alineada a la izquierda y helpers de centrado).
- Sin cambios de API, datos ni dependencias. No altera los contratos de guardado, recomendación ni historial.
- Los requisitos de resaltado de emociones y de ancho estable del historial viven hoy en cambios en curso (`polish-ultrawide-mobile-and-collection` y `refine-grid-and-quick-recommendation`); este cambio se redacta de forma aditiva para no depender del orden de archivado.
