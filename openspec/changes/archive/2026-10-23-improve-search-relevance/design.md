# Design

## Context

La búsqueda actual vive en `src/services/server/spotify.ts` (`searchStuff`) y devuelve la respuesta cruda de Spotify para `type=album,artist&limit=10`. La ruta `src/app/api/search/route.ts` valida la consulta y traduce errores; el hook `useAlbumSearch` consume `SearchResponse`; la página `src/app/search/page.tsx` solo pinta `result.albums.items` y descarta `result.artists.items`.

El proyecto ya separa vistas, hooks, servicios de cliente/servidor y utilidades puras (ver `docs/ARCHITECTURE.md`). La ficha `/artists/[id]` y la tarjeta `ArtistCard` ya existen, y la respuesta de Spotify contiene todos los campos que necesita el flujo de guardado (`SpotifyAlbum` completo), así que no hace falta tocar el modelo de datos ni Firestore.

Ver `proposal.md` para la motivación y `specs/album-search/spec.md` para el contrato de comportamiento.

## Goals / Non-Goals

**Goals:**

- Detectar una coincidencia exacta de artista sin depender de la posición que Spotify le dé en la respuesta.
- Sustituir los álbumes genéricos por la discografía relevante del artista exacto, conservando objetos `SpotifyAlbum` completos para que el guardado siga funcionando igual.
- Mostrar los artistas en `/search` con un componente presentacional reutilizable y enlaces a su ficha.
- Degradar a los resultados generales si la consulta específica falla, sin convertir una búsqueda válida en un error.

**Non-Goals:**

- Cambiar el contrato de `GET /api/search` ni el tipo `SearchResponse`.
- Añadir paginación, caché nueva o buscador dentro de `/artists`.
- Cambiar el flujo de guardado, la ficha de artista o el filtrado de su discografía.
- Decidir si un álbum concreto es “válido” para la colección: la búsqueda sigue mostrando álbumes y singles, no solo álbumes de estudio.

## Decisions

### 1. La coincidencia exacta se calcula en el servidor

`searchStuff` normaliza la consulta y los nombres de los artistas devueltos:

- descompone Unicode (`NFD`) y elimina diacríticos;
- pasa a minúsculas;
- colapsa espacios y recorta extremos.

Después busca el primer artista cuyo nombre normalizado sea igual a la consulta normalizada. No se usa la primera posición de Spotify porque el ranking puede colocar antes una coincidencia parcial: al buscar `Air`, Spotify devuelve `Airbag` primero y `Air` después.

**Alternativa descartada**: comparar en el cliente. El cliente no debe decidir ranking ni hacer peticiones adicionales, y la respuesta debe llegar ya ordenada para que cualquier consumidor de la API se beneficie.

### 2. La discografía exacta se obtiene con una segunda búsqueda de álbumes

Cuando hay coincidencia exacta se hace una petición adicional:

```text
GET /v1/search?q=artist:"<nombre>"&type=album&limit=50
```

y se conservan solo los álbumes en los que aparece el `id` del artista exacto. Se descartan:

- `album_type === "compilation"`;
- duplicados por `album.id`.

El resultado se limita a 12 elementos y sustituye a `albums.items`. Si la lista filtrada queda vacía, se mantienen los álbumes originales. La respuesta conserva la forma `albums` / `artists`; solo cambia el contenido y el orden.

**Por qué no `/artists/{id}/albums`**: ese endpoint devuelve `SpotifyArtistAlbum`, que no tiene todos los campos de `Album` (`available_markets`, `external_urls`, `href`, `uri`, `release_date_precision`, etc.). Usarlo obligaría a inventar campos o a hacer una segunda llamada por lotes a `/albums`, y el flujo de guardado persiste el objeto completo. La búsqueda de álbumes ya devuelve `SpotifyAlbum` completos y evita esa traducción.

**Alternativa descartada**: filtrar solo los 10 álbumes de la respuesta inicial. Es más barato, pero deja fuera discos del artista que Spotify no coloca en el top 10 y no resuelve casos como `Air`, donde solo aparece un disco válido entre coincidencias parciales.

### 3. Los artistas se reordenan y deduplican, pero no se recortan en el servidor

Si hay coincidencia exacta, ese artista pasa a la primera posición de `artists.items`; después se eliminan duplicados por `id`. La API sigue devolviendo hasta 10 artistas y la vista decide cuántos muestra (4), para no acoplar el contrato a una decisión visual.

**Alternativa descartada**: devolver solo el artista exacto. La sección debe servir también para consultas que no son un nombre exacto, y el usuario puede querer elegir otra coincidencia.

### 4. La vista usa `ArtistCard` sin acción de favorito

La sección nueva es un componente presentacional en `src/app/search/components/SearchArtists.tsx` que recibe `artists` y pinta una cuadrícula con `ArtistCard`. Se pasa `isFavorite={false}` y se omite `onToggleFavorite`, de modo que la tarjeta queda solo como enlace a `/artists/[id]`; la página de búsqueda no necesita cargar artistas favoritos ni duplicar esa lógica.

La página calcula `artists` y `albums` una sola vez a partir de `result` y decide:

- artistas > 0: sección de artistas;
- álbumes > 0: cuadrícula actual;
- artistas > 0 y álbumes = 0: sección de artistas + mensaje `noAlbumsFound`;
- ambos = 0: estado vacío actual con sugerencias de la colección.

**Alternativa descartada**: reutilizar `useArtistSearch` dentro de `/search`. Duplicaría la petición, el debounce y el estado de búsqueda de artistas; la respuesta de `/api/search` ya trae lo necesario.

### 5. Fallo de la consulta específica = degradación, no error

La segunda petición se envuelve en su propio `try/catch`. Si falla, se conserva la respuesta inicial y se reporta con `reportApiError(error, "search", "warning")`. La búsqueda general sigue siendo válida y no debe mostrar el estado de error por un fallo de enriquecimiento.

### 6. La normalización y el filtrado viven en utilidades puras

Se amplía `src/utils/searchTerms.ts` con funciones puras y testeables:

- normalización de nombres para comparar;
- selección del artista exacto;
- filtrado/deduplicación de álbumes del artista.

Así `services/server/spotify.ts` solo orquesta las llamadas y la lógica de ranking se puede verificar sin red.

## Risks / Trade-offs

- **Homónimos**: dos artistas con el mismo nombre pueden hacer que se elija el que Spotify devuelva primero. → Se mantiene la sección de artistas para que la persona pueda abrir la ficha correcta; el ranking de Spotify decide el desempate.
- **Discografía incompleta en la búsqueda**: `artist:"..."` puede no devolver todos los discos del artista. → La tarjeta enlaza a `/artists/[id]`, que ya carga la discografía completa y filtrada.
- **Más singles visibles**: al conservar los singles del artista exacto, la cuadrícula puede llenarse de lanzamientos cortos. → Se limita a 12 y se excluyen recopilatorios; la ficha del artista sigue siendo la vía para una discografía limpia.
- **Una petición extra a Spotify**: solo ocurre con coincidencia exacta. → Si falla o hay límite de peticiones, se degrada a los resultados iniciales sin romper la búsqueda.
- **Nombres con comillas o caracteres especiales** en la sintaxis `artist:"..."`. → La consulta se construye escapando comillas y barras invertidas antes de codificarla.
- **Normalización agresiva**: quitar tildes puede unir nombres distintos (`Rosalía` y `Rosalia`). → Es el comportamiento deseado para la búsqueda; si hay varias coincidencias exactas, se conserva el orden de Spotify.

## Migration Plan

No hay migración de datos ni cambios de esquema. El despliegue es de código: servicio, utilidades, vista, componente y traducciones. La API mantiene la misma forma de respuesta, así que se puede revertir volviendo a los archivos anteriores sin limpiar datos. No se necesita feature flag.

## Open Questions

Ninguna pendiente que cambie el alcance o el contrato.
