# Design

## Context

Ver `proposal.md` — Why. Hoy `users/{uid}/artists/{artistId}` guarda los artistas seguidos y `GET /api/userArtists?userId=` los lista (id, nombre, imágenes, géneros). `services/spotify.ts` ya expone `getArtistAlbums`, que consulta `artists/{id}/albums` con `include_groups=album,single` y filtra álbumes y EPs (los EPs llegan bajo `single` con `total_tracks >= 3`). El panel lateral (`src/components/Header.tsx`) lista las secciones privadas. El endpoint de novedades es una agregación por artista, y Spotify no ofrece un listado batch de álbumes por artista.

## Goals / Non-Goals

**Goals:**

- Agregar novedades de N artistas sin multiplicar las llamadas a Spotify por visita.
- Mostrar la sección en `/releases` sin romper la página si un artista falla.

**Non-Goals:**

- Fechas futuras o anuncios: **fuera de alcance**. Ver la decisión 7 y el requisito «Solo lanzamientos publicados»; la API pública de Spotify no permite descubrir pre-saves.
- Notificaciones, badges de "no visto" y ordenación personalizada.
- Guardar identidad de usuario en la caché.

## Decisions

### 1. Ventana de 60 días

Se consideran novedades los lanzamientos con `release_date` dentro de los últimos 60 días. 60 días da margen a "reciente" sin llenar la página de clásicos.

**Alternativas consideradas**

- _Solo "nuevo desde tu última visita"_: exige guardar estado por usuario y complica la v1. Descartada.
- _30 días_: demasiado corto para usuarios que siguen pocos artistas. Descartada.

### 2. Endpoint servidor `GET /api/artistReleases?userId=`

El servidor lee los artistas seguidos, consulta Spotify y devuelve la lista ya agregada. Así el token de Spotify no viaja al cliente y la página recibe datos listos.

### 3. Caché Firestore `artistReleases/{artistId}`

Documento por artista con `{ releases, fetchedAt }`, sin ningún identificador de usuario. Si `fetchedAt` tiene menos de 24 h, se sirve de caché; si no, se consulta Spotify y se actualiza. Reduce las llamadas (una por artista) a lo sumo una vez al día por artista.

**Alternativas consideradas**

- _Sin caché_: una llamada por artista en cada visita → límites de Spotify y lentitud. Descartada.
- _Caché en memoria_: no sobrevive entre instancias en despliegue serverless. Descartada.

### 4. Reutilizar la consulta de discografía y ampliarla

Se reutiliza la lógica de `getArtistAlbums` (`include_groups=album,single`) y se filtran los lanzamientos por fecha. Se excluyen compilaciones (`album_type = compilation`) y apariciones en trabajos de otros (`include_groups` sin `appears_on`). A diferencia de la discografía, aquí **sí** se incluyen singles (un single nuevo es noticia), etiquetados por tipo.

### 5. Resiliencia por artista

Los artistas se resuelven con `Promise.all` sobre una función que nunca lanza: si la consulta de un artista falla, se usa su caché previa si existe y, si no, se omite. Un fallo puntual no tumba la página.

### 6. Agrupación en `/releases`

La página agrupa por mes (más reciente primero), muestra portada, nombre, artista, fecha y tipo, y abre la ficha del álbum al pulsar. El mes se calcula a partir de `release_date`.

### 7. Próximos lanzamientos: fuera de alcance

Se descarta mostrar lanzamientos futuros (pre-venta o pre-save) porque **no hay forma pública de descubrirlos**. Evidencia recogida el 2026-10-17 contra dos pre-saves reales —U2 *Carnaval De Luz* (2026-11-13) y Trivium *Crown In The Grave* (2026-11-20)— y un barrido de 40 artistas populares:

- `GET /albums/{id}` **sí** devuelve el pre-release completo (fecha futura y pistas), pero **solo si se conoce el identificador**.
- Ese identificador **no se puede descubrir**: el lanzamiento no aparece en `artists/{id}/albums` (en ningún mercado), ni en `search`, ni en `browse/new-releases`. Los singles ya publicados de un disco no publicado tampoco salen en el listado del artista.
- En el barrido, **0 de 40** artistas tenían alguna fecha futura en `artists/{id}/albums`.
- Sin identificador no hay ficha; sin descubrimiento no hay identificador. Por eso el feed saldría casi siempre vacío.
- Fuentes externas descartadas: MusicBrainz conoce el disco y la fecha correctos pero **no enlaza** al identificador de Spotify (solo a Wikidata); Wikidata no tiene la propiedad del identificador de álbum de Spotify; Deezer y Apple/iTunes no devuelven lanzamientos futuros.
- La única fuente completa sería el GraphQL interno de Spotify (`api-partner.spotify.com/pathfinder`, el que alimenta "Álbum en camino"), descartado por no oficial, frágil y contrario a los ToS.

**Alternativas consideradas**

- _MusicBrainz como índice de descubrimiento_: cobertura muy irregular y sin mapeo al identificador de Spotify. Descartada.
- _Lista curada a mano_: mantiene identificadores de pre-save a mano; no es mantenible. Descartada.
- _GraphQL interno de Spotify_: funcional pero frágil y con riesgo de ToS. Descartada.

## Risks / Trade-offs

- [N llamadas por artista] → caché de 24 h y filtrado temprano; si la lista crece, limitar el número de artistas por carga.
- [Límites/cuota de Spotify (dev mode)] → caché + degradación por artista; la página sigue con lo disponible.
- [`release_date_precision` = `year`] → sin mes/día fiables; se descartan esos casos de la ventana o se comparan solo por año, aceptando menos precisión.
- [Colaboraciones repetidas entre artistas] → dedupe por id de lanzamiento.

## Migration Plan

No requiere migración. La colección `artistReleases` se llena bajo demanda. Despliegue normal; sin cambios de datos existentes.

## Open Questions

- ¿Badge de "novedades no vistas" por usuario? Fuera de alcance de esta v1; se puede evaluar después sin cambiar estas specs.
