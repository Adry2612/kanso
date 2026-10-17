# Tasks

## 1. Registro en el feed global

- [x] 1.1 En `src/app/api/toggleFavorite/route.ts`, al crear un favorito nuevo, registrar el álbum en `communityAlbums` (id = `albumDocId`, `addedAt: serverTimestamp()`, `merge: true`) dentro de un `try/catch` que no altere la respuesta del guardado
- [x] 1.2 Verificar por lectura que no se guarda ningún identificador de usuario y que volver a añadir el mismo álbum no duplica documento

## 2. Endpoint del feed

- [x] 2.1 Crear `src/app/api/communityAlbums/route.ts` (`GET`) que devuelva los últimos N álbumes (por `addedAt` desc) resolviendo los datos desde `albums`; ante error, lista vacía; verificar con `npx tsc --noEmit`

## 3. Sección en la búsqueda

- [x] 3.1 Añadir los textos a `src/locales/es.json` y `src/locales/en.json` (namespace `search`)
- [x] 3.2 Mostrar en el estado inicial de `src/app/search/page.tsx` la sección "Añadidos por la comunidad" siempre; al pulsar un álbum, abrir su ficha; si está vacía o falla, mostrar la sección con un estado vacío que invita a añadir el primer disco

## 4. Verificación de integración

- [x] 4.1 Ejecutar `npx tsc --noEmit`, `npm run lint` sin errores nuevos y `npm run build` completando correctamente
- [x] 4.2 Prueba manual: añadir un álbum nuevo desde la búsqueda → aparece en el inicio de la búsqueda; añadirlo de nuevo → no se duplica; pulsarlo abre su ficha

## Workflow follow-up

- Archivar el change tras la revisión del usuario.
- Verificar el resultado archivado.
