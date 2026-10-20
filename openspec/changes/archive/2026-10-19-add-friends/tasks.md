# Tasks

## 1. Base de identidad y dependencia

- [x] 1.1 Añadir `qrcode.react` a `package.json` y verificar que `npm install` lo instala y `npm ls qrcode.react` lo muestra
- [x] 1.2 Ampliar `AuthenticatedUser` y `authenticate()` en `src/lib/apiAuth.ts` con `isAnonymous` (desde `decoded.firebase.sign_in_provider`) y añadir `requireRegistered()` con respuesta 403; verificar con `npx tsc --noEmit` y una llamada de invitado a una ruta protegida
- [x] 1.3 Añadir el generador de códigos base32 sin caracteres ambiguos y la reserva transaccional en `friendCodes/{code}`; verificar que dos creaciones concurrentes no devuelven el mismo código

## 2. Perfil y API de amigos

- [x] 2.1 Implementar `GET /api/friends`: crea el perfil perezosamente si falta, refresca nombre/avatar desde Firebase Auth y devuelve perfil, amigos y solicitudes entrantes/salientes; verificar que la primera llamada crea `users/{uid}` y `friendCodes/{code}`
- [x] 2.2 Implementar `POST /api/friends/requests` por código; verificar envío correcto, rechazo del código propio, duplicados, ya amigos y usuario inexistente con errores genéricos
- [x] 2.3 Implementar la aceptación recíproca: si existe la solicitud inversa, crear la amistad en ambos sentidos sin dejar pendientes; verificar con dos cuentas que ambas listas cambian
- [x] 2.4 Implementar `PATCH /api/friends/requests/[id]` para aceptar o rechazar; verificar que solo la destinataria puede responder y que aceptar escribe los dos documentos de amistad en un batch
- [x] 2.5 Implementar `DELETE /api/friends/[uid]`; verificar que desaparece de ambas listas y que se puede volver a enviar una solicitud
- [x] 2.6 Implementar `GET /api/publicProfile?code=`: devuelve solo nombre, avatar y relación (`none`, `pending`, `friend`), con o sin token; verificar que el JSON no incluye email, UID, favoritos, artistas ni historial

## 3. Ruta de amigos

- [x] 3.1 Crear `src/app/friends/page.tsx` con el mismo lenguaje visual (`kanso-panel`, `Reveal`) y estado vacío con CTA para compartir; verificar que renderiza con sesión registrada
- [x] 3.2 Añadir el alta por código con validación y mensajes de error legibles; verificar que un código válido envía la solicitud y uno inválido no rompe la página
- [x] 3.3 Añadir las secciones de solicitudes entrantes/salientes y la lista de amigos con nombre y avatar, incluyendo aceptar, rechazar y eliminar; verificar cada acción contra la API
- [x] 3.4 Bloquear la página para invitados con una invitación a crear cuenta; verificar que no se llama a la API de amigos y que la CTA lleva al registro
- [x] 3.5 Añadir «Amigos» al panel lateral con icono `UsersRound`, las claves de los locales `es`/`en` y el estado activo de la ruta; verificar que navega a `/friends` en escritorio y en cajón móvil
- [x] 3.6 Crear el modal de compartir con QR (`qrcode.react`), enlace corto, copiar y compartir nativo cuando exista; verificar que el QR se dibuja sin peticiones a servicios externos y que el enlace copiado abre `/f/<código>`
- [x] 3.7 Crear la vista pública `src/app/f/[code]/page.tsx` sin panel lateral y con la acción de añadir; verificar los estados de código válido, inexistente, sin sesión, invitado y ya amigo
- [x] 3.8 Extender `Header` para tratar `/f/*` como página pública y revisar el responsive de `/friends` y `/f/*` a 320, 390, 768 y 1024 px; verificar que no hay desborde horizontal

## 4. Verificación de integración

- [x] 4.1 Ejecutar `npx tsc --noEmit`, `npm run lint` y `npm run build`; verificar que terminan sin errores
- [x] 4.2 Probar el flujo completo con dos cuentas registradas: compartir QR, abrir el perfil, enviar solicitud, aceptar, ver la lista y eliminar; verificar que ambos lados quedan coherentes
- [x] 4.3 Verificar la privacidad: invitado recibe 403 en las rutas de amigos, el perfil público no filtra datos y un amigo no puede leer la colección ajena
- [x] 4.4 Ejecutar `openspec validate add-friends --strict` y corregir los avisos propios del change (solo quedan los avisos SHALL/MUST en español, convención del proyecto)

## Workflow follow-up

- Archivar el change cuando se cumplan los requisitos de revisión del proyecto.
- Verificar el resultado archivado.
