# Tasks

## 1. Precondición y utilidades puras

- [x] 1.1 Confirmar que la rama de trabajo es `refactor/collection` y que `report-api-errors` ya está archivado; verificar con `git branch --show-current` y que `openspec list --json` ya no lo muestre como cambio activo
- [x] 1.2 Ampliar `src/utils/searchTerms.ts` con la normalización de nombres de artista, la selección del artista exacto, el filtrado/deduplicación de sus álbumes y la construcción segura de la consulta `artist:"..."`; verificar con `npx tsc --noEmit`
- [x] 1.3 Cubrir con comprobaciones los casos de normalización (`ROSALÍA`/`rosalia`, espacios sobrantes, nombres con comillas) y de filtrado (recopilatorios y álbumes de otros artistas); verificar ejecutando los casos contra la respuesta real de Spotify antes de conectar la vista

## 2. Servicio de búsqueda

- [x] 2.1 Extender `searchStuff` en `src/services/server/spotify.ts` para detectar la coincidencia exacta, reordenar/deduplicar `artists.items` y sustituir `albums.items` por los álbumes y singles del artista exacto, con límite de 12 y sin recopilatorios; verificar con `npx tsc --noEmit`
- [x] 2.2 Añadir el respaldo cuando no haya álbumes del artista o falle la segunda consulta, reportando con `reportApiError(error, "search", "warning")`; verificar que una búsqueda forzada a fallar sigue devolviendo los resultados generales
- [x] 2.3 Comprobar la respuesta de `GET /api/search` con consultas de artista (`Queen`, `Air`, `Phoenix`, `Rosalía`) y de álbum (`OK Computer`, `LUX`): el artista exacto queda primero, sus álbumes no incluyen recopilatorios ni discos de otros artistas, y las búsquedas por título conservan resultados variados

## 3. Interfaz de búsqueda

- [x] 3.1 Crear el componente presentacional `src/app/search/components/SearchArtists.tsx` con una cuadrícula de `ArtistCard` sin acción de favorito y enlace a `/artists/[id]`; verificar con `npx tsc --noEmit`
- [x] 3.2 Integrar la sección en `src/app/search/page.tsx` a partir de `result.artists.items`, mostrar como máximo 4 artistas y ajustar los estados: artistas + álbumes, solo artistas (mensaje `noAlbumsFound`), solo álbumes y sin resultados; verificar que la página sigue sin llamadas a `fetch`
- [x] 3.3 Añadir las etiquetas nuevas en `src/locales/es.json` y `src/locales/en.json`, reutilizando `noAlbumsFound` para el caso sin álbumes; verificar que no quedan claves usadas sin definir en ninguno de los dos idiomas
- [x] 3.4 Verificar en el navegador `/search`: la sección de artistas aparece, el artista exacto queda primero, el enlace abre su ficha, el estado sin álbumes muestra artistas + mensaje y una búsqueda sin coincidencias mantiene el estado vacío actual

## 4. Integración y cierre

- [x] 4.1 Ejecutar `npx tsc --noEmit`, `npm run lint` y `npm run build` (con el servidor de desarrollo parado) y confirmar que los tres pasan
- [x] 4.2 Revisar en escritorio y móvil que los resultados no cambian para búsquedas por título, que las tarjetas de artista son navegables y que no hay errores en consola ni peticiones fallidas
- [x] 4.3 Guardar un álbum encontrado al buscar un artista exacto para confirmar que el flujo de guardado conserva todos los campos de `SpotifyAlbum` y que el modal funciona igual
- [x] 4.4 Ejecutar la carpeta `04-search` de Bruno (incluida la búsqueda y los endpoints de artista/álbum) y confirmar que los contratos de respuesta siguen siendo válidos
- [x] 4.5 Ejecutar `openspec validate improve-search-relevance --strict` y corregir cualquier aviso antes de la revisión final

## Workflow follow-up

- Archivar el cambio después de que la revisión manual de búsqueda esté aprobada.
- Verificar el resultado archivado y que `openspec list --json` ya no muestra `improve-search-relevance` como activo.
