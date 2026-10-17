# Design

## Context

Ver `proposal.md` — Why. `services/spotify.ts` ya obtiene token (client credentials) y expone `searchStuff`, `getArtist`, `getAlbum`. Las rutas API leen Firestore con el Web SDK en servidor (patrón actual, a endurecer en `secure-api-and-firestore`). `src/components/Header.tsx` define los `navItems` del panel. Existe un `HeartButton` reutilizable para marcar favoritos.

## Goals / Non-Goals

**Goals:**

- Buscar artistas y ver su discografía de álbumes y EPs.
- Persistir artistas favoritos por usuario.
- Integrarse en la navegación existente.

**Non-Goals:**

- Notificaciones / seguimiento en tiempo real.
- Ordenaciones y etiquetas de artistas.
- Reglas de seguridad y Admin SDK (change aparte).

## Decisions

### 1. Filtrado de "álbumes y EPs, nunca singles"

Spotify no expone un grupo `ep` en `GET /artists/{id}/albums`; los EPs llegan agrupados como `single`. Por eso:

- Se solicita `include_groups=album,single` (se descartan `appears_on` y `compilation`).
- Se conserva `album_type === "album"`.
- Para `album_type === "single"`, se conserva solo si `total_tracks >= 3` (heurística de EP).
- Se deduplica por `id` y se ordena por `release_date` descendente.

**Trade-off aceptado:** un "single" con 3 o más pistas se trataría como EP (falso positivo) y un EP de 1–2 pistas se descartaría. Es la aproximación más fiable sin metadatos extra.

**Alternativas consideradas**

- _Mostrar todo lo que devuelve Spotify_: incluiría singles, que la persona ha pedido excluir. Descartada.
- _Confiar solo en `album_type`_: trataría todos los EPs como singles. Descartada.

### 2. Paginación

`GET /artists/{id}/albums` pagina a 50; se recorren páginas (con un tope razonable, p. ej. 4) hasta agotar `next` para no truncar la discografía.

### 3. Artistas favoritos en Firestore

Colección `users/{uid}/artists/{artistId}` con el snapshot del artista (id, name, images, genres, followers). `POST /api/toggleArtistFavorite` alterna; `GET /api/userArtists?userId=` lista. Sigue el patrón de favoritos de álbumes.

### 4. Rutas y navegación

- `/artists`: buscador + resultados + "Tus artistas".
- `/artists/[id]`: cabecera del artista + discografía (reutilizando `AlbumCard`).
- `Header.tsx`: nuevo `navItem` con icono de `lucide-react`.

### 5. i18n

Textos bajo el namespace `artists` en `src/locales/{es,en}.json`.

## Risks / Trade-offs

- [Heurística de EP imperfecta] → documentada; se puede refinar con datos adicionales.
- [Llamadas a Spotify por artista] → se cachea la respuesta del token en memoria (mejora futura) y se pagina de forma acotada.
- [Endpoints públicos con Web SDK en servidor] → se endurecen en `secure-api-and-firestore`.

## Migration Plan

No requiere migración. Las colecciones se crean al primer uso. Despliegue normal.
