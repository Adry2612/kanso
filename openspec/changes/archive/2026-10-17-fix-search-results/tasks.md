# Tasks

## 1. Entrada visible de listas y rejillas

- [x] 1.1 En `src/components/motion/index.tsx`, añadir a `Stagger` un modo `onMount` que use `animate="show"` en lugar de `whileInView="show"`, conservando el escalonado; verificar con `npx tsc --noEmit`
- [x] 1.2 Aplicar `onMount` a las rejillas de datos (search, artists, artists/[id], releases, favorites, recomendationHistory, StartPage, AlbumTracklist, SortModal), sin tocar el landing público `src/app/page.tsx`; verificar que el landing sigue usando revelado al scroll

## 2. Error de búsqueda frente a sin resultados

- [x] 2.1 En `src/app/api/search/route.ts`, responder con error (502) cuando la respuesta de Spotify no traiga `albums`/`artists`, en lugar de devolverla con 200

## 3. Verificación de integración

- [x] 3.1 Ejecutar `npx tsc --noEmit`, `npm run lint` sin errores nuevos y `npm run build` completando correctamente
- [x] 3.2 Prueba manual: buscar "u2" y "rolling stones" → los álbumes se ven siempre (repetir varias veces y con la pestaña en segundo plano); forzar una respuesta inválida de `/api/search` → la búsqueda muestra error y no "sin resultados"
