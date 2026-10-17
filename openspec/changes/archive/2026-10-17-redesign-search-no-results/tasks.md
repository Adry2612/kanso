# Tasks

## 1. Textos del estado sin resultados

- [x] 1.1 Añadir a `src/locales/es.json` y `src/locales/en.json` (namespace `search`) los textos del estado (título, descripción, "Limpiar búsqueda"); verificar que la clave existe en ambos idiomas

## 2. Estado vacío accionable en la búsqueda

- [x] 2.1 En `src/app/search/page.tsx`, sustituir el párrafo de "sin resultados" por un estado vacío con el término buscado, la acción "Limpiar búsqueda" y chips de `collectionMoods`/`collectionTags` cuando existan
- [x] 2.2 Verificar por lectura que el estado sin resultados solo aparece cuando no hay `error` y que el error técnico se sigue mostrando por separado

## 3. Verificación de integración

- [x] 3.1 Ejecutar `npx tsc --noEmit`, `npm run lint` sin errores nuevos y `npm run build` completando correctamente
- [x] 3.2 Prueba manual: buscar algo sin resultados → aparece el estado vacío con "Limpiar búsqueda" y sugerencias; simular un fallo de red → aparece el error técnico

## Workflow follow-up

- Archivar el change tras la revisión del usuario.
- Verificar el resultado archivado.
