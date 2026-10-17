# Tasks

## 1. Textos

- [x] 1.1 Añadir a `src/locales/es.json` y `src/locales/en.json` los textos de la recomendación rápida; verificar que existen en ambos idiomas

## 2. Acceso y elección mínima

- [x] 2.1 En `src/app/home/pages/StartPage.tsx`, añadir el botón "Recomendación rápida" y un bloque compacto con formatos (Cualquiera/Vinilos/CDs/Cassettes) y etiquetas de la colección (`collectionTags`), sin pedir emoción
- [x] 2.2 Al confirmar, navegar a `/recommendation` con `format` y, si se elige, `tag`, sin `moods`; verificar que no se envía ninguna emoción
- [x] 2.3 Verificar que sin filtros la recomendación se lanza igual y que sin coincidencias se muestra el estado ya existente

## 3. Verificación de integración

- [x] 3.1 Ejecutar `npx tsc --noEmit`, `npm run lint` sin errores nuevos y `npm run build` completando correctamente
- [x] 3.2 Verificado E2E contra la API (usuario de prueba): solo formato físico → álbum de ese formato; solo etiqueta → álbum con esa etiqueta; sin filtros → cualquier álbum; sin coincidencias → estado vacío (404)

## Workflow follow-up

- Archivar el change tras la revisión del usuario.
- Verificar el resultado archivado.
