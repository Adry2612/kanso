# Tasks

## 1. Coordinación y línea base

- [x] 1.1 Confirmar que `collection-experience` sigue activo y anotar en su `tasks.md` que este cambio se archiva después; ajustar su delta de `album-collection` para que «Vista de cuadrícula y lista» y «Presentación de los álbumes» no mencionen fecha ni hora, y verificar con `openspec validate collection-experience --strict` y `openspec validate collection-ui-polish --strict`
- [x] 1.2 Registrar la línea base con `npx tsc --noEmit`, `npm run lint` y `npm run build` antes de tocar la colección, para no confundir fallos previos con regresiones de este cambio

## 2. Tipos y utilidades puras

- [x] 2.1 Añadir `CollectionGroupBy` (`none`, `date`, `artist`, `letter`, `year`) y los campos `groupBy` e `incompleteOnly` a `FilterOptions`/`CollectionFilters` y a `FilterModalProps`; actualizar el objeto de filtros vacío y verificar con `npx tsc --noEmit`
- [x] 2.2 Separar `groupCollection` de la ordenación: recibir `groupBy` y locale, agrupar por fecha de guardado, artista, letra o año de lanzamiento, con orden fijo de grupos y «Sin año» para fechas ausentes; verificar con un script de datos sintéticos y `npx tsc --noEmit`
- [x] 2.3 Crear `getCollectionInsights` y el predicado de incompleto en `src/utils/collection.ts`, contando por separado álbumes sin emociones y sin actividades y la unión de ambos; verificar con datos sintéticos que la unión no duplica álbumes
- [x] 2.4 Actualizar `hasCollectionFilters` y `countActiveFilters` para incluir `groupBy !== "none"` e `incompleteOnly`; verificar con `npx tsc --noEmit` y una comprobación manual de los contadores

## 3. Estado de la colección

- [x] 3.1 Adaptar `useCollectionFilter` para ordenar primero y agrupar después solo si `groupBy` no es `none`, devolviendo `sortedCollection` y `collectionGroups`; verificar con `npx tsc --noEmit`
- [x] 3.2 Ampliar `useCollectionPage` con `insights`, `dismissIncompleteNotice`, `reviewIncomplete` y el reseteo de `groupBy`/`incompleteOnly`; verificar que cambiar de pestaña conserva la agrupación y que «Revisar» limpia búsqueda y filtros antes de activar incompletos
- [x] 3.3 Actualizar `clearFilters` para restablecer agrupación e incompletos junto al resto, y comprobar que los chips y el contador del botón de filtros reflejan ambos estados con `npx tsc --noEmit`

## 4. Modal de filtros y chips activos

- [x] 4.1 Añadir al `FilterModal` la sección «Agrupar por» con las cinco opciones y la sección «Estado» con «Solo incompletos»; verificar con teclado, `Escape`, foco y `npm run lint`
- [x] 4.2 Ampliar `CollectionActiveFilters` con el chip de agrupación y el de incompletos, ambos removibles, y con sus etiquetas traducidas; verificar que al quitarlos se restablece `none` o `false`
- [x] 4.3 Ajustar el botón «Limpiar filtros» del modal para que también borre agrupación e incompletos, y comprobar que la lista vuelve a mostrarse plana y completa

## 5. Página de colección

- [x] 5.1 Crear `CollectionIncompleteNotice` con el total, el desglose de emociones/actividades, la acción «Revisar», el cierre temporal y `aria-live="polite"`; verificar sus variantes con datos sintéticos
- [x] 5.2 Integrar el aviso entre las pestañas y el buscador, ocultarlo cuando no hay incompletos, cuando el filtro está activo o en «Por escuchar», y hacer que «Revisar» aplique el filtro; verificar los tres casos
- [x] 5.3 Quitar `timestampLabel` y `formatTime` de las tarjetas y filas de colección y pendientes, manteniendo la marca de tiempo en el historial; verificar que el historial sigue mostrando la hora y que la colección no muestra fecha ni hora
- [x] 5.4 Renderizar la colección como lista plana cuando `groupBy` es `none`, con cabeceras solo al agrupar, y dejar la pestaña «Por escuchar» como lista plana sin cabeceras; verificar las cinco opciones de agrupación y el orden dentro de cada grupo
- [x] 5.5 Aplicar el ritmo vertical entre resumen y pestañas, y entre buscador y chips de emoción, con `mt` explícitos; verificar a 320, 390, 768 y escritorio que no hay solapamientos ni desborde horizontal

## 6. Textos y documentación

- [x] 6.1 Añadir a `src/locales/es.json` y `en.json` las claves de agrupación, aviso de incompletos, filtro, acción, cierre, desglose y «Sin año», con singulares y plurales correctos; verificar que no aparece ninguna clave en crudo en la interfaz
- [x] 6.2 Actualizar `README.md` y `docs/TRADUCCIONES.md` para describir la agrupación explícita, la ausencia de fechas en la colección y el aviso de incompletos; verificar que las rutas y comandos documentados siguen existiendo

## 7. Verificación final

- [x] 7.1 Ejecutar `npx tsc --noEmit`, `npm run lint` y `npm run build`, y confirmar que no hay errores nuevos ni avisos distintos de los de imágenes ya existentes
- [ ] 7.2 Recorrer con una cuenta con álbumes las cinco agrupaciones, las siete ordenaciones, el filtro de incompletos, «Revisar», el cierre del aviso, «Limpiar filtros» y la pestaña «Por escuchar»; confirmar que no aparecen fechas ni horas
- [x] 7.3 Revisar con teclado y lector de pantalla el aviso, el modal de filtros, los chips y el conmutador de vista; comprobar foco visible, nombres accesibles y el anuncio del recuento
- [x] 7.4 Cierre de restos: `grep -rn "timestampLabel\\|formatTime" src/app/collection` no debe encontrar usos, y `grep -rn "groupByDate" src/hooks/client/useCollectionFilter.ts` solo debe aparecer dentro de la rama de agrupación por fecha explícita

## Workflow follow-up

- Archivar `collection-experience` primero, tras actualizar su delta para que no mencione fecha ni hora.
- Archivar `collection-ui-polish` después y verificar que el spec principal de `album-collection` queda coherente.
- Revisar que `collection-experience` conserva pendientes las tareas de migración que no forman parte de este cambio.
