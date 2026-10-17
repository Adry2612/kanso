# Tasks

## 1. Contrato de etiquetas en la recomendación por emoción

- [x] 1.1 En `src/app/api/getAlbumsByMood/route.ts`, sustituir la interfaz `TagFilter`/`subtags` por `tags: string[]` en formato `"categoria:valor"` y ajustar `matchesTagsAndSubtags` para comparar contra las etiquetas del favorito en minúsculas; verificar que una petición con una etiqueta existente devuelve un álbum y con una inexistente devuelve 404
- [x] 1.2 Actualizar el tipo del parámetro `tags` en `src/lib/api/recomendation.ts` a `string[]`; verificar con `npx tsc --noEmit`
- [x] 1.3 Comprobar que `StartPage` (`handleRecommendation`) y la recomendación por actividad siguen enviando/comparando `"categoria:valor"` sin cambios adicionales

## 2. Apertura del álbum recomendado en Spotify

- [x] 2.1 En `src/app/home/pages/RecomendationPage.tsx`, usar `albumInfo.external_urls?.spotify` en lugar de `albumInfo.spotifyUrl` (incluido el tipo `AlbumInfo`); verificar con `npx tsc --noEmit` y que la URL pasada es la del álbum
- [x] 2.2 Añadir una guardia en `openSpotify` (`src/lib/spotifyUtils.ts`) para que una URL ausente o inválida no lance excepción; verificar invocándola con un valor vacío sin que se produzca error

## 3. Verificación de integración

- [x] 3.1 Ejecutar `npx tsc --noEmit` y `npm run lint` sin errores nuevos y `npm run build` completando correctamente
- [ ] 3.2 Prueba manual: guardar un álbum con una etiqueta, generar una recomendación seleccionando esa etiqueta (debe devolver un álbum, no el mensaje de "no encontrado") y pulsar "Escuchar en Spotify" (debe abrir sin lanzar error)

## Workflow follow-up

- Archivar el change tras la revisión del usuario.
- Verificar el resultado archivado.
