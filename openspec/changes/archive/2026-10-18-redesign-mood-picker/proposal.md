# Proposal

## Why

El selector de emociones y actividad no convence, por tres motivos concretos:

1. **El carrusel.** `MoodSelector` sigue arrastrando un carrusel de 3 en 3 con flechas, rueda del ratón, puntos de posición y atajos de teclado. Además de incómodo, **contradice la spec**: `recommendations` exige mostrar todas las emociones a la vez, sin paginar. En la práctica ese carrusel ya no se usa (el componente solo se invoca en modo compacto, que pinta una rejilla), así que es peso muerto que marca el lenguaje visual del componente.
2. **Demasiadas emociones.** Son 15 en una lista plana, sin agrupar ni jerarquizar: cuesta encontrar la que buscas. Y hay tres controles distintos para lo mismo (la rejilla de `MoodSelector`, la rejilla de `StartPage`, y los filtros de `FilterModal`), cada uno con su propio aspecto.
3. **El aspecto visual.** Los emoji sobre cajas rectangulares no encajan con el sistema de tokens, la tipografía ni el acento mint del resto de la app; cada tile parece un botón suelto sin jerarquía entre elegido y no elegido.

## What Changes

- **Eliminar el carrusel** de `MoodSelector` (flechas, rueda, puntos): no se pagina, se muestran todas.
- **Agrupar las 15 emociones en familias** con una etiqueta corta, para que se puedan recorrer de un vistazo.
- **Unificar el lenguaje visual** del selector entre la pantalla de inicio y el modal de guardado (un mismo componente, un mismo aspecto).
- **Refinar la selección**: jerarquía clara entre elegido y no elegido, respuesta táctil, accesibilidad correcta (`aria-pressed`, foco visible) y respeto por `prefers-reduced-motion`.
- **Alinear con la spec** vigente: todas las emociones a la vez, sin paginar, con su marca y una etiqueta legible en el tema activo.

## Capabilities

### Modified Capabilities

- `recommendations`: el catálogo de emociones y actividades se presenta agrupado y sin paginar, con un aspecto coherente en toda la aplicación; se retira el carrusel.

## Impact

- `src/components/MoodSelector.tsx` (reescrito, sin carrusel).
- `src/app/home/pages/StartPage.tsx` (usa el componente unificado).
- `src/app/search/components/SelectedAlbumModal/steps/SaveAlbumModal.tsx` (deja de pasar `compact`).
- `src/constants/moods.ts` (metadatos de agrupación; el catálogo y las claves NO cambian).
- `src/locales/es.json` y `src/locales/en.json` (etiquetas de familia).

## Fuera de alcance

- Cambiar las **claves** del catálogo de emociones o reducir su número: los datos guardados las usan y `FilterModal` las necesita. Reducir el catálogo sería otro cambio, con migración de datos.
