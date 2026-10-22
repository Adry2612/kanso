# Proposal

## Why

Hoy un álbum solo puede guardarse en la colección, y ese flujo exige emociones, actividades, formatos y etiquetas. No hay forma de apartar un disco que despierta interés sin decidir todavía qué representa para la persona. La sección de pendientes cubre ese paso previo: guardar un disco para escucharlo después sin ensuciar la colección ni inventar emociones que aún no existen.

## What Changes

- **Pestaña «Por escuchar».** La página de colección pasa a tener dos pestañas: «Colección» y «Por escuchar». La nueva pestaña lista los discos pendientes del usuario, del más reciente al más antiguo.
- **Elección de destino al guardar.** El asistente de guardado empieza preguntando si el disco va a la colección o a pendientes.
  - **Colección:** continúa el asistente actual de emociones, actividades, formato y etiquetas.
  - **Por escuchar:** guarda el álbum directamente, sin emociones, actividades, formato ni etiquetas.
- **Estados excluyentes.** Un disco no puede estar a la vez en la colección y en pendientes. Al pasarlo a la colección se elimina de pendientes; al guardarlo en pendientes no se ofrece si ya está en la colección.
- **Ficha del disco pendiente.** El detalle indica que el disco está en pendientes y ofrece pasarlo a la colección o quitarlo de pendientes. Pasar a la colección abre el asistente completo.
- **Búsqueda y tarjetas.** Los resultados de búsqueda y las tarjetas distinguen «Añadir a mi colección», «Ya está en tu colección» y «En pendientes».
- **Privacidad.** Los pendientes son privados: no se publican en el feed de comunidad ni se incluyen en la biblioteca compartida con amistades.

## Capabilities

### New Capabilities

- `listen-later`: lista privada de álbumes que la persona quiere escuchar, sin emociones, actividades, formato ni etiquetas; incluye su almacenamiento, API, exclusividad con la colección y presentación en la pestaña «Por escuchar».

### Modified Capabilities

- `album-collection`: el guardado incorpora la elección de destino y el asistente completo queda reservado a la colección.
- `album-detail`: el detalle reconoce el estado pendiente y ofrece pasarlo a la colección o quitarlo de pendientes.
- `album-search`: los resultados distinguen el estado pendiente y abren el flujo adecuado para incorporarlo.

## Impact

- **Nuevas rutas API:** `src/app/api/listenLater/route.ts` para listar, guardar y quitar pendientes.
- **API existente:** `src/app/api/toggleFavorite/route.ts` elimina el pendiente al guardar en la colección para mantener la exclusividad.
- **Tipos y cliente:** `src/types/favorites.ts`, `src/lib/api/listenLater.ts`.
- **Interfaz:** `src/app/favorites/page.tsx` (pestañas), `src/app/albums/[albumId]/page.tsx` (estado pendiente), `src/app/search/page.tsx` y `src/components/AlbumCard.tsx` (estado en resultados), `src/app/search/components/SelectedAlbumModal/**` (destino, estado pendiente y confirmación).
- **Traducciones:** `src/locales/es.json` y `src/locales/en.json`.
- **Datos:** nueva subcolección `users/{uid}/listenLater`; se reutiliza el catálogo global `albums`. Sin cambios en la colección existente ni en las reglas de acceso directo a Firestore.
- **Sin dependencias nuevas.**
