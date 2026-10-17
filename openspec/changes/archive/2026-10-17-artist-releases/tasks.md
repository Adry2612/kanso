# Tasks

## 1. Consulta de lanzamientos por artista

- [x] 1.1 En `services/spotify.ts`, añadir una función que devuelva los lanzamientos (álbumes, EPs y singles) de un artista dentro de una ventana de días, excluyendo compilaciones y apariciones y descartando los de `release_date_precision` = `year`; verificar con `npx tsc --noEmit` y una llamada de prueba a un artista con lanzamientos recientes que solo devuelve elementos dentro de la ventana

## 2. Caché por artista

- [x] 2.1 En `src/app/api/artistReleases/route.ts` (o un módulo de apoyo), leer y escribir `artistReleases/{artistId}` con `{ releases, fetchedAt }` y vigencia de 24 h; verificar por lectura que el documento no guarda ningún identificador de usuario y que, dentro de las 24 h, no se llama a Spotify

## 3. Endpoint de novedades

- [x] 3.1 Crear `src/app/api/artistReleases/route.ts` (`GET ?userId=`) que lea los artistas seguidos, resuelva cada artista con caché o Spotify usando promesas que nunca lanzan, deduplique por id de lanzamiento y ordene por fecha descendente; verificar con `npx tsc --noEmit` y peticiones de prueba (sin artistas seguidos → lista vacía sin llamar a Spotify; con artistas → lanzamientos agregados)

## 4. Página `/releases`

- [x] 4.1 Crear `src/app/releases/page.tsx` que cargue las novedades, las agrupe por mes (más reciente primero) y muestre portada, nombre, artista, fecha y tipo; al pulsar, abre la ficha del álbum. Verificar en el navegador con al menos un lanzamiento
- [x] 4.2 Añadir el estado de carga y el estado vacío ("Sigue a artistas para ver sus novedades"); verificar sin artistas seguidos
- [x] 4.3 Añadir los textos a `src/locales/es.json` y `src/locales/en.json`

## 5. Navegación

- [x] 5.1 Añadir la entrada "Novedades" en `src/components/Header.tsx` con destino `/releases`; verificar que el panel la muestra, la marca como activa y navega a la página

## 6. Verificación de integración

- [x] 6.1 Ejecutar `npx tsc --noEmit`, `npm run lint` sin errores nuevos y `npm run build` completando correctamente
- [x] 6.2 Verificado E2E contra la API (usuario de prueba): seguir a un artista con lanzamientos de los últimos 60 días → aparecen agrupables por mes, ordenados y sin duplicados; la segunda carga se sirve de caché (sin reescribir `fetchedAt`, sin repetir la llamada a Spotify); un artista sin novedades no ensucia la lista

## Workflow follow-up

- Archivar el change tras la revisión del usuario.
