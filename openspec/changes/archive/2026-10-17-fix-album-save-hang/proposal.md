# Proposal

## Why

Al guardar algunos álbumes, el modal se queda cargando y no avanza: sigue en el paso de formato físico y hay que volver a pulsar "Guardar" para que se guarde. Es un fallo intermitente y confuso en el momento clave de la app.

## What Changes

- Quitar del guardado la llamada a Spotify (`getArtist`) que no aporta nada (su resultado solo se registraba en logs) y que es el punto que puede fallar: si esa llamada falla, toda la petición responde con error y el guardado no termina.
- Evitar el redireccionamiento (308) del cliente al llamar al endpoint (URL con barra final), reduciendo latencia y puntos de fallo.
- Mostrar el error de guardado junto a las acciones y mantener el botón para reintentar, en lugar de que el fallo parezca un cuelgue.

Fuera de alcance: rediseñar el asistente de guardado.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `album-collection`: se especifica que el guardado debe completarse y confirmarse de forma fiable, y que si falla debe informar y permitir reintentar.

## Impact

- `src/app/api/toggleFavorite/route.ts` (quitar la llamada a Spotify y código muerto asociado).
- `src/lib/api/favorites.ts` (URL sin barra final y cabecera JSON).
- `src/app/search/components/SelectedAlbumModal/steps/SaveAlbumModal.tsx` (error visible y reintentable).
- Sin cambios de contrato de datos.
