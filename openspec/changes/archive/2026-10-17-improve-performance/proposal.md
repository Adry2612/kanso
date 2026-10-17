# Proposal

## Why

Tres costes evitables, medidos en el código:

1. **Token de Spotify sin cachear.** `services/spotify.ts` pide un token nuevo en **cada** petición (se ve en los logs: "Getting Spotify access token…" en todas). Un token dura una hora; hoy se pide miles de veces.
2. **Imágenes sin pistas de carga.** Los 12 `<img>` de portadas no llevan `loading` ni `decoding`, así que el navegador no difiere las que están fuera de pantalla y no puede decodificarlas en segundo plano.
3. **Dependencias pesadas sin usar.** `colorthief`, `@fortawesome/react-fontawesome` y `@fortawesome/fontawesome-svg-core` no se importan en ningún sitio: peso muerto en `package.json` (y en el árbol de dependencias).

## What Changes

- **Cachear el token** de Spotify en memoria, con caducidad, y **deduplicar** peticiones concurrentes; quitar los `console.log` ruidosos del camino del token.
- Añadir `loading="lazy"` y `decoding="async"` a las portadas (la portada principal de la ficha de álbum se carga con prioridad).
- **Quitar** `colorthief` y los dos paquetes de `@fortawesome/*`.

## Capabilities

Sin cambios de comportamiento observable: el token sigue siendo el mismo y las imágenes se ven igual. Es una mejora de rendimiento interna.

## Impact

- `services/spotify.ts` (token).
- ~12 ficheros con `<img>`.
- `package.json` / `package-lock.json`.
- Sin cambios de datos ni de interfaz.
