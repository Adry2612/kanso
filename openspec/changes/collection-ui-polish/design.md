# Design

## Context

Ver `proposal.md` — Why. El punto de partida es la implementación de `collection-experience`, que sigue activa y sin archivar:

- `useCollectionFilter` agrupa por fecha cuando no hay ordenación o cuando es por fecha, y `groupCollection` deriva el grupo de la ordenación.
- `CollectionPage` pasa `formatTime(entry.savedAt)` y `formatTime(entry.addedAt)` a `GalleryCard`/`GalleryRow`.
- `FilterOptions` solo contiene emociones, géneros, formatos y etiquetas; `FilterModal` no tiene agrupación ni estado.
- No existe ningún cálculo de álbumes incompletos, aunque `CollectionAlbum` ya expone `labeledFeelings` y `activities`.
- `ToastProvider` existe y funciona abajo a la derecha, pero se descarta para este aviso.
- La cabecera pinta el resumen con `mt-5`; las pestañas tienen `mb-8` pero ningún margen superior; los chips de emoción tienen `mb-6` pero ningún margen superior.

## Goals / Non-Goals

**Goals:**

- Desacoplar agrupación y ordenación, con «Sin agrupar» como estado inicial.
- Quitar las marcas de tiempo de colección y pendientes sin tocar el historial.
- Introducir un aviso accionable de incompletos calculado en cliente, sin API nueva.
- Corregir el ritmo vertical de cabecera, pestañas, buscador y chips.

**Non-Goals:**

- Persistir agrupación, vista o aviso entre sesiones o visitas.
- Editar emociones o actividades desde la tarjeta.
- Cambiar la API, los datos, la migración o los pesos de recomendación.
- Añadir toasts o modificar `ToastProvider`.

## Decisions

### 1. Agrupación como parte de los filtros

`CollectionFilters` se amplía con `groupBy: CollectionGroupBy` e `incompleteOnly: boolean`:

```ts
type CollectionGroupBy = "none" | "date" | "artist" | "letter" | "year";
```

`groupBy` vive en el mismo objeto que los filtros porque el modal es su único punto de control y «Limpiar filtros» debe devolverlo a `"none"`. **Alternativa descartada:** estado independiente en el hook; obliga a duplicar el reseteo y el modal no puede reflejarlo con una sola fuente de verdad.

`FilterOptions`/`CollectionFilters` se actualiza también en `FilterModalProps` y en el objeto vacío del hook. `hasCollectionFilters` y `countActiveFilters` incluyen `groupBy !== "none"` e `incompleteOnly`, para que los chips y el botón de filtros reflejen el estado real.

### 2. `groupBy` manda; `sortBy` solo ordena

`utils/collection.ts` separa las dos responsabilidades:

- `sortCollection(collection, sortMethod)` no cambia.
- `groupCollection(collection, groupBy, locale)` agrupa por:
  - `date`: `formatLongDate(savedAt, locale)`, sin horas.
  - `artist`: nombre del primer artista.
  - `letter`: inicial del título en mayúsculas.
  - `year`: año de `release_date`; los álbumes sin fecha caen en «Sin año».
  - `none`: no se llama; la página pinta la lista plana.

El orden de los grupos es fijo: fecha de más reciente a más antigua, artista y letra de A-Z, año de más reciente a más antiguo. La ordenación activa solo reordena dentro de cada grupo. **Alternativa descartada:** seguir usando `sortMethod` para decidir el grupo, que es exactamente el acoplamiento que el feedback pide eliminar.

`useCollectionFilter` devuelve `sortedCollection` (lista plana cuando `groupBy === "none"`) y `collectionGroups` (vacío cuando no hay agrupación). La página decide si pinta cabeceras según `groupBy`.

### 3. Aviso de incompletos calculado en cliente

Se añade una utilidad pura `getCollectionInsights(collection)`:

```ts
{
  incomplete: number; // unión: falta emoción o actividad
  missingMoods: number;
  missingActivities: number;
}
```

- `missingMoods`: `labeledFeelings`/`moods` vacíos.
- `missingActivities`: `activities` vacío.
- `incomplete`: álbumes que cumplen cualquiera de las dos condiciones, contados una sola vez.

El aviso es un componente presentacional `CollectionIncompleteNotice` colocado entre las pestañas y la barra de búsqueda. Muestra el total y, si hay ambos casos, el desglose. La acción «Revisar»:

1. limpia la búsqueda y los filtros de emoción, género, formato y etiqueta;
2. activa `incompleteOnly`;
3. deja `groupBy` en `"none"` para revisar en lista plana.

El aviso guarda un estado local `dismissed` que se pierde al recargar; no usa `sessionStorage` ni desactiva el filtro. **Alternativa descartada:** toast con `ToastProvider`; desaparece solo, no deja rastro accionable y el usuario pidió algo persistente pero discreto.

El aviso se oculta si `incomplete === 0`, si `incompleteOnly` está activo o si la pestaña es «Por escuchar». El contenedor usa `aria-live="polite"` para anunciar el recuento cuando termina la carga, y la acción es un botón con texto visible.

### 4. Sin fechas ni horas en colección y pendientes

`GalleryCard` y `GalleryRow` mantienen `timestampLabel` como propiedad opcional porque el historial la sigue usando. La colección deja de pasarla: desaparecen `formatTime` y las marcas superiores/`· hora` de las tarjetas y filas. En pendientes se elimina además `pendingGroups`: se pinta `filteredPending` como lista plana, manteniendo el orden de `sortListenLater`.

### 5. Ritmo vertical

Se aplican separaciones explícitas, no márgenes implícitos:

- Pestañas: `mt-10 md:mt-12` además de su `mb-8`.
- Buscador: conserva `mt-8` respecto a pestañas.
- Chips de emoción: `mt-6` respecto al buscador y `mb-4` antes de los filtros activos.
- Filtros activos: `mb-6`; si no hay chips, el listado conserva su `mt-10`.
- El aviso de incompletos ocupa su propio bloque con `mb-6` y no compite con el buscador.

En móvil se mantienen los mismos saltos; no se introducen anchos fijos. **Alternativa descartada:** usar `space-y-*` en el contenedor principal, que ya contiene secciones heterogéneas y acoplaría la separación a la estructura.

### 6. Modal de filtros

Se añaden dos bloques al final del modal:

- **Agrupar por**: cinco opciones tipo radio/segmented, con «Sin agrupar» seleccionada por defecto.
- **Estado**: interruptor «Solo incompletos».

`hasActiveFilters` incluye ambos para mostrar «Limpiar filtros». Al limpiar se restablecen a `none` y `false`. Los chips de filtros activos muestran «Agrupado por: …» e «Incompletos», ambos removibles.

### 7. Coordinación con `collection-experience`

Los specs principales todavía no contienen las exigencias introducidas por `collection-experience` («Vista de cuadrícula y lista» y «Presentación de los álbumes…» mencionan la fecha). Para no dejar el spec principal contradictorio:

1. actualizar el delta de `collection-experience` para que esas dos exigencias no mencionen fecha ni hora;
2. archivar `collection-experience` antes de archivar este cambio;
3. archivar `collection-ui-polish` después, aplicando sus deltas sobre el spec ya sincronizado.

## Risks / Trade-offs

- **[Specs contradictorios si se archiva en orden incorrecto]** → tarea explícita de coordinación y nota en el proposal; `openspec validate` de este cambio solo toca exigencias ya presentes en el spec principal.
- **[El aviso se vuelve ruidoso]** → solo aparece con incompletos, es una línea discreta, se puede ocultar hasta recargar y desaparece al activar el filtro.
- **[Agrupación y ordenación confusas]** → el modal explica «Agrupar por» por separado de «Ordenar», y los chips muestran ambos estados.
- **[Grupos de año con álbumes sin fecha]** → se agrupan en «Sin año» en lugar de descartarse.
- **[Pérdida de contexto al quitar la fecha]** → decisión explícita del usuario; la fecha sigue disponible en los datos y en el historial de recomendaciones, no se elimina del modelo.
- **[Regresión de espaciado en móvil]** → verificación a 320, 390 y 768 px con la comprobación de `scrollWidth`.
- **[El filtro de incompletos deja la lista vacía por combinarse con otros]** → la acción «Revisar» limpia el resto de filtros; activarlo manualmente desde el modal sí puede combinarse, como el resto.

## Migration Plan

No hay migración de datos ni despliegue especial. El cambio se aplica sobre la implementación de `collection-experience`; el orden de archivo de cambios es el descrito en la decisión 7. Rollback: revertir el cambio de UI; no toca Firestore ni la API.

## Open Questions

Ninguna.
