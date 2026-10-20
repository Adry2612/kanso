# Tasks

## 1. Modelo y configuración de compartición

- [ ] 1.1 Añadir `FriendSharingSettings` a `src/types/friends.ts`, extender `FriendProfile` con `sharing` y crear `normalizeSharing()` en `src/lib/friends.ts` con todas las secciones a `false` por defecto; verificar que `npx tsc --noEmit` pasa y que un perfil nuevo devuelve las tres secciones desactivadas.
- [ ] 1.2 Hacer que `ensureUserProfile()` lea, normalice y persista `sharing` sin borrar preferencias existentes; verificar que un perfil con `sharing.recommendations=true` conserva el valor tras un nuevo `GET /api/friends`.
- [ ] 1.3 Ampliar `GET /api/friends` para devolver `profile.sharing`; verificar con una cuenta temporal que la respuesta incluye las tres claves y que una cuenta sin configuración devuelve `false` en todas.
- [ ] 1.4 Implementar `PATCH /api/friends/sharing` con autenticación, `requireRegistered()`, validación de booleanos, actualización parcial y `Cache-Control: no-store`; verificar que un cambio válido persiste, un valor no booleano devuelve `400`, un invitado `403` y una petición sin token `401`.

## 2. Lectura segura de la biblioteca compartida

- [ ] 2.1 Crear `src/lib/friendLibrary.ts` con las proyecciones `SharedAlbumSummary`, `SharedRecommendation`, `SharedCollectionAlbum` y `SharedArtist`, y con `loadSharedRecommendations`, `loadSharedCollection` y `loadSharedArtists`; verificar que las funciones no devuelven `tags`, correo, UID, código de invitación ni documentos completos de álbum.
- [ ] 2.2 Extraer la normalización de formatos de favoritos a un helper compartido y usarlo en `userFavorites` y en `friendLibrary`; verificar que un favorito antiguo con `format` string y `ownership` produce el mismo array en ambas rutas.
- [ ] 2.3 Implementar `GET /api/friends/[uid]/library` comprobando token, cuenta registrada, UID válido y las dos direcciones de la amistad antes de leer datos; verificar que una amistad recibe `200`, una persona que no es amistad recibe `404` genérico, un invitado `403`, una petición sin token `401` y un UID inexistente `404`.
- [ ] 2.4 Devolver solo las secciones activadas y omitir las desactivadas, incluyendo arrays vacíos cuando una sección activa no tiene datos; verificar con una cuenta que activa solo recomendaciones, luego solo álbumes y luego solo artistas.
- [ ] 2.5 Resolver los álbumes con `db.getAll(...)` y ordenar las tres secciones por fecha descendente; verificar que la respuesta no hace una lectura por álbum y que el orden coincide con las fechas de `providedAt`, `addedAt` y `addedAt` de artistas.
- [ ] 2.6 Añadir `getFriendLibrary(uid)` y `updateSharing(settings)` a `src/lib/api/friends.ts` con manejo de errores; verificar que `npx tsc --noEmit` pasa y que la UI puede llamar a ambas funciones sin duplicar `authFetch`.

## 3. Configuración y entrada desde Amigos

- [ ] 3.1 Añadir el panel «Qué compartes» en `/friends` con tres interruptores accesibles (`role="switch"`, `aria-checked`, foco visible), guardado optimista y reversión con mensaje de error; verificar que cada cambio persiste tras recargar y que un error de red restaura el estado anterior.
- [ ] 3.2 Añadir el enlace «Ver perfil» en cada fila de amistad y conectarlo a `/friends/[uid]`; verificar que la navegación abre el perfil y que «Amigos» sigue marcado como sección activa en el sidebar.
- [ ] 3.3 Actualizar `friends.subtitle` y `friends.share.description` en `es.json` y `en.json` para no prometer que los amigos solo ven nombre y avatar, manteniendo que el QR público nunca muestra la colección; verificar ambos idiomas en la página y en el modal.
- [ ] 3.4 Añadir las claves de i18n de privacidad y perfil compartido en `es.json` y `en.json`; verificar que no hay claves sin traducir y que los textos de estado vacío y error se muestran en ambos idiomas.

## 4. Perfil privado de amigo

- [ ] 4.1 Crear `src/app/friends/[uid]/page.tsx` con estados de carga, sin sesión, invitado, error con reintento y perfil no disponible; verificar que sin sesión o como invitado se muestra el CTA de acceso y no se llama a la API.
- [ ] 4.2 Renderizar la cabecera con enlace de vuelta a `/friends`, avatar, nombre y nota de perfil compartido; verificar que el enlace vuelve a la lista sin perder la configuración.
- [ ] 4.3 Renderizar solo las secciones activas con un estado vacío por sección y un estado vacío único cuando no se comparte nada; verificar con cuentas que no comparten nada, que comparten una sección vacía y que comparten las tres.
- [ ] 4.4 Implementar las recomendaciones agrupadas por fecha con portada, álbum, artistas, emociones y enlace a Spotify; verificar que se muestran en orden descendente y que no hay acciones de edición.
- [ ] 4.5 Crear `SharedAlbumCard` de solo lectura con portada, título, artistas, emociones, actividades, formato y enlace a Spotify; verificar que no muestra etiquetas personales, botón de añadir ni acción de eliminar.
- [ ] 4.6 Renderizar los artistas con `ArtistCard` sin `onToggleFavorite`; verificar que se ve el nombre, la imagen y los géneros, y que no aparece el botón de favorito.
- [ ] 4.7 Ajustar el perfil compartido para 320, 390, 768 y 1024 px sin desbordamiento horizontal; verificar con las herramientas del navegador que las tarjetas, los chips y la cabecera se apilan correctamente.
- [ ] 4.8 Traducir todos los estados y etiquetas del perfil privado en `es.json` y `en.json`; verificar que no quedan textos hardcodeados y que el cambio de idioma actualiza la página.

## 5. Privacidad e integración

- [ ] 5.1 Probar el flujo completo con dos cuentas registradas: privacidad inicial, activar cada sección, ver solo lo activado desde la otra cuenta, desactivar y comprobar que desaparece, y eliminar la amistad y comprobar que el perfil deja de estar disponible.
- [ ] 5.2 Verificar que `/f/[code]` y `/api/publicProfile` no cambian y que la biblioteca no se puede obtener con un código público; comprobar que la respuesta de la biblioteca no incluye correo, UID, código de invitación, etiquetas ni notas.
- [ ] 5.3 Confirmar que las reglas de Firestore no se han modificado y que el cliente sigue sin leer Firestore directamente; verificar con `git diff -- firestore.rules` y una búsqueda de lecturas directas en los componentes nuevos.
- [ ] 5.4 Ejecutar `npx tsc --noEmit`, `npm run lint` y `npm run build`; verificar que los tres terminan sin errores.
- [ ] 5.5 Ejecutar `openspec validate share-friend-library --strict`; verificar que no hay errores nuevos y que solo aparecen los avisos conocidos de SHALL/MUST en español.

## Workflow follow-up

- Archivar `add-friends` cuando la revisión esté cerrada, para consolidar la especificación principal de amigos.
- Archivar `share-friend-library` después de implementar y verificar las tareas.
- Desplegar y probar el flujo con cuentas reales de Google; el proveedor de email/password sigue deshabilitado.
