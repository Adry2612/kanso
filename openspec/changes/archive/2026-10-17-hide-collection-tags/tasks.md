# Tasks

## 1. Retirar las etiquetas de las tarjetas

- [x] 1.1 Eliminar la prop `tags`, el import de `TagList` y su render en `src/components/AlbumCard.tsx`; verificar con `npx tsc --noEmit` que no queda ningún consumidor que pase `tags`
- [x] 1.2 En `src/app/favorites/page.tsx`, dejar de pasar `tags` a `AlbumCard`; verificar por lectura que la tarjeta muestra portada, nombre y artista únicamente
- [x] 1.3 Comprobar que `TagList` sigue usándose en `src/app/albums/[albumId]/page.tsx` y que el detalle no cambia

## 2. Verificación de integración

- [x] 2.1 Ejecutar `npx tsc --noEmit`, `npm run lint` sin errores nuevos y `npm run build` completando correctamente
- [ ] 2.2 Prueba manual: abrir `/favorites` con álbumes que tengan etiquetas y comprobar que no se muestran en las tarjetas; abrir el detalle de uno de ellos y comprobar que sus etiquetas siguen visibles

## Workflow follow-up

- Archivar el change tras la revisión del usuario.
- Verificar el resultado archivado.
