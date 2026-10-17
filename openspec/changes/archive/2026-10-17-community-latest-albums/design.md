# Design

## Context

Ver `proposal.md` — Why. `src/app/api/toggleFavorite/route.ts` es el único punto donde se añade un álbum a una colección; ya persiste el álbum en la colección compartida `albums` (con `addDoc`) y el favorito por usuario. El inicio de `/search` ya pinta secciones (búsquedas de la comunidad, sugerencias de la colección) y degrada sin romper si una falla.

## Goals / Non-Goals

**Goals:**

- Registrar álbumes añadidos de forma anónima e idempotente.
- Mostrarlos en el inicio de la búsqueda.

**Non-Goals:**

- Ranking por popularidad ni paginación infinita.
- Moderación.
- Reglas de seguridad y Admin SDK (change aparte).

## Decisions

### 1. Documento por álbum en `communityAlbums`

Colección `communityAlbums` con id = `albumDocId` (el id del documento en la colección `albums`) y campos `{ albumId, addedAt }`. Se usa `setDoc(..., { merge: true })` con `addedAt: serverTimestamp()`, de modo que volver a añadir el mismo álbum solo actualiza la fecha y nunca duplica.

**Alternativas consideradas**

- _Leer `albums` ordenado por fecha de creación_: el catálogo no tiene esa fecha y mezcla álbumes antiguos. Descartada.
- _Derivar de los favoritos de todos los usuarios_: costoso y requiere Admin SDK. Descartada.

### 2. El registro no bloquea el guardado

El registro del feed se hace en `toggleFavorite` envuelto en `try/catch` y no altera la respuesta del guardado: si el feed falla, el favorito se guarda igual.

### 3. `GET /api/communityAlbums`

Devuelve los últimos N (p. ej. 8) por `addedAt` desc. Para cada entrada, obtiene el álbum de `albums` por `albumId` y devuelve `{ id, name, images, artists }`. Si un álbum no existe, se omite. Ante error, devuelve lista vacía (degradación).

### 4. Presentación

Sección "Añadidos por la comunidad" siempre presente en el estado inicial, con rejilla de tarjetas reutilizando `AlbumCard` (sin acción de añadir, solo abrir ficha). Cuando el feed está vacío o falla al cargar, la sección se muestra con un estado vacío que invita a añadir el primer disco, sin romper el resto del estado inicial. Mostrarla siempre hace visible la función y evita que la pantalla parezca sin cambios cuando aún no hay datos.

## Risks / Trade-offs

- [N+1 al resolver los álbumes] → N pequeño (8); aceptable y consistente con `userFavorites`.
- [Spam del feed] → mitigable con reglas y rate limiting en el change de seguridad.
- [Escritura pública con Web SDK en servidor] → se endurece en `secure-api-and-firestore`.

## Migration Plan

No requiere migración. La colección se llena con los próximos añadidos. Despliegue normal.
