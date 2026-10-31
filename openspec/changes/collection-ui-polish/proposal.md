# Proposal

## Why

Tras usar la nueva colección, la agrupación por fecha y la hora de guardado añaden ruido y hacen que la lista se lea como un historial, no como una colección. Además, la cabecera, las pestañas, el buscador y los chips de emoción quedan demasiado juntos, y no hay ninguna señal cuando hay álbumes guardados a los que les faltan emociones o actividades, que son los datos que alimentan las recomendaciones.

Este cambio pule la experiencia de la colección sin tocar datos, API ni el comportamiento del historial: la agrupación pasa a ser una elección explícita, desaparecen las marcas de tiempo de la colección, se separan visualmente las herramientas y se añade un aviso discreto y accionable para completar los álbumes incompletos. Depende de la implementación de `collection-experience`, que sigue activa.

## What Changes

- **Agrupación explícita.** La colección deja de agruparse por fecha automáticamente. El modal de filtros incorpora «Agrupar por» con las opciones «Sin agrupar» (por defecto), «Fecha de guardado», «Artista», «Letra del título» y «Año de lanzamiento». La agrupación deja de derivarse de la ordenación.
- **Sin marcas de tiempo en la colección.** Las tarjetas y filas dejan de mostrar la hora y la fecha de guardado; se conservan portada, título, artista, emociones, formatos y acción de Spotify. La fecha también desaparece de la pestaña «Por escuchar», que pasa a ser una lista plana ordenada de la incorporación más reciente a la más antigua.
- **Más aire entre bloques.** Se separan la cabecera y el resumen de las pestañas, y el buscador de los chips de emoción, con un ritmo vertical consistente en escritorio y móvil.
- **Aviso de álbumes incompletos.** Un aviso discreto sobre el listado indica cuántos álbumes no tienen emociones o no tienen actividades, con un desglose cuando corresponde. La acción «Revisar» activa un filtro «Incompletos» que queda también disponible en el modal de filtros y como chip removible. El aviso no aparece si no hay incompletos, si el filtro ya está activo o en la pestaña de pendientes.
- **Sin notificaciones emergentes.** Se descarta el toast: el aviso es persistente pero no invasivo, y la acción lleva directamente a los álbumes que hay que completar.
- **Contrato de regresión.** Se actualizan los specs de `album-collection` y `listen-later`; no cambian la API, Firestore, la migración ni el historial de recomendaciones.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `album-collection`: agrupación elegida en filtros, presentación sin fecha ni hora, filtro y aviso de álbumes incompletos, y separación visual de cabecera, pestañas, buscador y chips.
- `listen-later`: listado plano sin agrupación ni fecha, conservando el buscador, la vista de cuadrícula/lista y los estados de carga, vacío y error.

## Impact

- **Pantalla y componentes:** `src/app/collection/page.tsx`, `CollectionTabs`, `CollectionMoodChips`, `CollectionActiveFilters` y el nuevo aviso de incompletos.
- **Estado y utilidades:** `useCollectionPage`, `useCollectionFilter`, `src/utils/collection.ts`, `src/types/collection.ts` (nuevos `GroupBy` y campos de filtro), y el modal compartido `FilterModal`.
- **Presentación compartida:** `GalleryCard` y `GalleryRow` conservan la marca de tiempo opcional para el historial; la colección deja de pasarla.
- **Textos:** `src/locales/es.json` y `en.json` con las etiquetas de agrupación, el aviso, el filtro y sus plurales.
- **Specs:** deltas de `album-collection` y `listen-later`; sin cambios en `navigation`, API ni Firestore.

## Fuera de alcance

- Edición masiva o edición directa de emociones y actividades desde la tarjeta; el aviso filtra y cada álbum se completa desde su detalle.
- Toasts, recordatorios persistentes entre sesiones o notificaciones push.
- Cambiar el historial de recomendaciones, su agrupación por fecha o sus marcas de tiempo.
- Cambiar la API, el esquema de Firestore, la migración o la lógica de recomendaciones.
- Rediseñar la colección más allá de la agrupación, las marcas de tiempo, el espaciado y el aviso de incompletos.
