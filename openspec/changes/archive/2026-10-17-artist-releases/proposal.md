# Proposal

## Why

La app ya permite descubrir y seguir artistas y ver su discografía, pero no avisa de lo que han publicado recientemente. Una sección de novedades de los artistas que sigues da motivos para volver y convierte la lista de artistas en algo vivo.

## What Changes

- Nueva página `/releases` con las novedades (álbumes, EPs y singles) de los artistas que el usuario sigue, agrupadas por mes y ordenadas por fecha de lanzamiento.
- Nuevo endpoint `GET /api/artistReleases?userId=` que, para cada artista seguido, consulta Spotify (`artists/{id}/albums`), filtra por los últimos 60 días, descarta compilaciones y apariciones, deduplica y ordena.
- Caché en Firestore (`artistReleases/{artistId}`, TTL 24 h) para no multiplicar las llamadas a Spotify (una por artista).
- Nueva entrada "Novedades" en el panel lateral.

Fuera de alcance: fechas futuras o anuncios (requieren otra fuente de datos), notificaciones y badges de "no visto". El retardo y el flujo de búsqueda no se tocan aquí.

## Capabilities

### New Capabilities

- `artist-releases`: novedades de los artistas que el usuario sigue, agregadas desde Spotify y presentadas en `/releases`.

### Modified Capabilities

- `navigation`: se añade la página `/releases` y su acceso en el panel lateral.

## Impact

- Nuevo `src/app/releases/page.tsx` y nuevo `src/app/api/artistReleases/route.ts`.
- `services/spotify.ts` (reutilizar/ampliar la consulta de álbumes por artista; ya existe `getArtistAlbums`).
- `src/components/Header.tsx` (nueva entrada) + `src/locales/{es,en}.json`.
- Nueva colección Firestore `artistReleases` (solo caché; no guarda identidad de usuario).
- Depende de `users/{uid}/artists/{artistId}` (artistas seguidos) y de las credenciales de Spotify ya configuradas.
