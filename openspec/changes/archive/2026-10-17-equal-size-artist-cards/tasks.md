# Tasks

## 1. Tarjeta de artista uniforme

- [x] 1.1 En `src/components/ArtistCard.tsx`, hacer la tarjeta `h-full`, `flex flex-col`, `justify-between`, y reservar siempre una línea (con `min-h`) para los géneros; verificar que el botón queda al pie
- [x] 1.2 En `src/app/artists/page.tsx`, añadir `h-full` a las celdas `StaggerItem` de "Tus artistas" y de los resultados

## 2. Verificación de integración

- [x] 2.1 Ejecutar `npx tsc --noEmit`, `npm run lint` sin errores nuevos y `npm run build` completando correctamente
- [x] 2.2 Prueba manual: en `/artists`, comparar tarjetas con y sin géneros (y nombres de distinta longitud) y comprobar que todas tienen la misma altura y el botón alineado

## Workflow follow-up

- Archivar el change tras la revisión del usuario.
- Verificar el resultado archivado.
