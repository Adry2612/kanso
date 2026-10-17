# Design

## Context

Ver `proposal.md` — Why. Al guardar un álbum, el flujo es `SaveAlbumModal.save()` → `addFavorite()` (`src/lib/api/favorites.ts`) → `POST /api/toggleFavorite` → `src/app/api/toggleFavorite/route.ts`.

Dos hallazgos reproducidos:

1. En la ruta, tras crear el álbum en el catálogo y antes de guardar el favorito, se ejecuta `const mainArtist = await getArtist(album.artists[0].id)` cuyo único uso es un `console.log`. `getArtist` obtiene un token de Spotify nuevo en cada llamada y hace una petición a Spotify; si esa petición falla (el endpoint de token de Spotify devuelve error), toda la ruta responde 500 y el guardado no se completa. Añade además ~1–2 s al primer guardado.
2. El cliente llama a `/api/toggleFavorite/` **con barra final**, lo que provoca un `308` de redirección a `/api/toggleFavorite` (round trip extra). El cliente además no envía cabecera `Content-Type`.

Ambos afectan al primer guardado; el segundo suele funcionar porque el álbum ya quedó en el catálogo del primer intento.

## Goals / Non-Goals

**Goals:**

- Que el guardado se complete y confirme de forma fiable.
- Que un fallo se vea y se pueda reintentar.

**Non-Goals:**

- Cambiar el contrato de datos ni el asistente.

## Decisions

### 1. Quitar la llamada a Spotify del guardado

Se elimina `getArtist(...)` (y el `console.log` asociado) de `toggleFavorite`. El guardado deja de depender de Spotify. Se retira también la función muerta `getAlbumAudioFeatures` si no se usa (ya comentada su invocación).

**Alternativas consideradas**

- _Hacer `getArtist` tolerante a fallos_: dejaría una llamada inútil y lenta. Descartada.

### 2. Cliente: URL correcta y cabecera JSON

`addFavorite` llama a `/api/toggleFavorite` (sin barra) con `Content-Type: application/json`, evitando el `308` y dejando el contrato de la petición explícito.

### 3. Error visible y reintentable

`SaveAlbumModal` muestra el error junto a las acciones (no solo dentro del área con scroll) y mantiene el botón operable para reintentar desde el mismo paso. El estado (emociones, actividades, formato, etiquetas) no se pierde.

## Risks / Trade-offs

- [Álbumes guardados a la vez que el feed de la comunidad] → el registro del feed se hace aparte y no bloquea (ver `community-latest-albums`).
- [Errores reales siguen ocurriendo] → ahora son visibles y reintentables en vez de parecer un cuelgue.

## Migration Plan

No requiere migración. Despliegue normal.
