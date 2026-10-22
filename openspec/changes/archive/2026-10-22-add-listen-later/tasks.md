# Tasks

## 1. Rama, tipos y API de pendientes

- [x] 1.1 Crear la rama `feat/listen-later` desde `main` y verificar con `git branch --show-current` que el trabajo parte de la rama correcta
- [x] 1.2 Definir los tipos de pendientes (`ListenLaterAlbum`, destino de guardado y resultado del guardado) y el cliente `src/lib/api/listenLater.ts` con listar, añadir y quitar; verificar con `npx tsc --noEmit`
- [x] 1.3 Implementar `src/app/api/listenLater/route.ts` con `GET`, `POST` y `DELETE`: autenticación por token, validación del álbum, reutilización del catálogo `albums`, escritura idempotente, rechazo si ya está en `favorites` y borrado idempotente; verificar con una sesión de prueba que lista, guarda, repite sin duplicar, rechaza un álbum inválido, rechaza sin token y elimina
- [x] 1.4 Actualizar `src/app/api/toggleFavorite/route.ts` para eliminar el pendiente en el mismo lote que guarda el favorito, y hacer que `GET /api/listenLater` excluya cualquier álbum presente en `favorites`; verificar que tras guardar en colección el álbum desaparece de pendientes y que un pendiente residual no se muestra si ya es favorito

## 2. Asistente de guardado y estados del modal

- [x] 2.1 Añadir a `SaveAlbumModal` la pantalla inicial de destino con «A la colección» y «Por escuchar», el guardado directo en pendientes y el salto de esa pantalla al editar un favorito o al pasar un pendiente a la colección; verificar los tres caminos en el navegador y que el asistente de colección conserva sus tres pasos y la validación de formato
- [x] 2.2 Ampliar `SelectedAlbumModal` con `isPending`, `pendingData`, `onPendingSaved` y `onPendingRemoved`, y añadir el paso de álbum pendiente con «Pasar a la colección» y «Quitar de pendientes»; verificar que el estado pendiente no se confunde con el de colección y que cancelar el asistente deja el disco en pendientes
- [x] 2.3 Adaptar la confirmación de guardado para el destino pendientes, con acciones «Ver pendientes» y «Deshacer», y enlazar «Ver pendientes» con la pestaña correspondiente de `/favorites`; verificar que deshacer elimina el pendiente y que la confirmación de colección no cambia
- [x] 2.4 Añadir las cadenas nuevas en `src/locales/es.json` y `src/locales/en.json` (pestañas, destinos, estados, acciones y errores); verificar que no queda ningún texto visible sin traducir en ambos idiomas

## 3. Colección, búsqueda y detalle

- [x] 3.1 Convertir `/favorites` en dos pestañas, cargar colección y pendientes en paralelo, listar los pendientes por fecha descendente y mostrar estados de carga, vacío y error con reintento; verificar que la colección conserva ordenación y filtros y que la pestaña activa se puede abrir desde el enlace de confirmación
- [x] 3.2 Cargar los pendientes también en `search/page.tsx`, añadir el estado pendiente a `AlbumCard` con precedencia colección > pendientes > no guardado, y conectar la tarjeta con las acciones del modal; verificar que un disco pendiente se distingue de uno guardado y de uno nuevo
- [x] 3.3 Cargar los pendientes en `albums/[albumId]/page.tsx` y mostrar el estado pendiente con «Pasar a la colección» y «Quitar de pendientes»; verificar que un disco pendiente no muestra emociones, actividades, formato ni etiquetas y que al guardarlo en colección la ficha cambia al estado de colección
- [x] 3.4 Revisar las tarjetas de la pestaña de pendientes en móvil y escritorio: portada, título y artistas legibles, sin desbordes, y navegación al detalle correcta; verificar en 320, 390 y 1280 px

## 4. Integración y verificación

- [x] 4.1 Verificar la privacidad: un pendiente no aparece en `GET /api/friends/[uid]/library` ni en `/api/communityAlbums`, y la API de pendientes rechaza peticiones sin token o de otra persona; dejar constancia de las comprobaciones realizadas
- [x] 4.2 Recorrer el flujo completo con una sesión real: añadir a pendientes desde búsqueda, verlo en la pestaña, pasarlo a la colección, comprobar que desaparece de pendientes y que la colección lo muestra; repetir con un disco ya favorito y con un pendiente eliminado
- [x] 4.3 Ejecutar `npm run format:check`, `npx tsc --noEmit`, `npm run lint` y `npm run build`; corregir cualquier error y dejar los cuatro comandos en verde
- [x] 4.4 Probar el flujo en 320, 390 y 1280 px, con el modal abierto y cerrado, comprobando que no hay desbordes horizontales, que el foco y el cierre funcionan y que no aparecen errores en consola

## Workflow follow-up

- Archivar el cambio cuando se cumplan los requisitos de revisión del proyecto.
- Verificar el resultado archivado y sincronizar la nueva capability `listen-later`.
