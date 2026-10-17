# Proposal

## Why

La pestaña de búsqueda arranca con señales de tu propia colección y con las últimas búsquedas de la comunidad, pero no muestra qué música nueva está entrando en la comunidad. Ver los últimos álbumes añadidos da ideas concretas y hace que la búsqueda se sienta viva.

## What Changes

- Registrar de forma **anónima y global** cada álbum que se añade a una colección, con su fecha (un documento por álbum, idempotente).
- Mostrar en el inicio de `/search` una sección con los **últimos álbumes añadidos por la comunidad**; al pulsar uno, se abre su ficha.
- Endpoint `GET /api/communityAlbums` que devuelve los últimos N con los datos de álbum.

Fuera de alcance: ranking por popularidad, moderación y curar el feed.

## Capabilities

### New Capabilities

- `community-albums`: feed global y anónimo de los últimos álbumes añadidos por la comunidad, presentado en el inicio de la búsqueda.

### Modified Capabilities

- Ninguna.

## Impact

- `src/app/api/toggleFavorite/route.ts` (registro del álbum en el feed al crear un favorito, sin bloquear el guardado).
- Nuevo `src/app/api/communityAlbums/route.ts` (`GET`).
- Nueva colección Firestore `communityAlbums` (un documento por álbum).
- `src/app/search/page.tsx` (sección en el estado inicial) + `src/locales/{es,en}.json`.
- Nota de seguridad: escritura global anónima siguiendo el patrón actual; se endurece en `secure-api-and-firestore`.
