# Tasks

## 1. Coordinación y línea base

- [x] 1.1 Registrar la línea base con `npx tsc --noEmit` y `npm run lint`; si hace falta `npm run build`, parar antes el servidor de desarrollo para no compartir `.next` y anotar el resultado
- [x] 1.2 Revisar los deltas de `authentication`, `api-security` y `error-monitoring` de los cambios en curso y confirmar que los requisitos nuevos son aditivos y no chocan al archivar; verificar con `npx openspec validate harden-error-and-session-states --strict`

## 2. Clasificación y registro en la API

- [x] 2.1 Clasificar los fallos de `verifyIdToken` en `src/lib/apiAuth.ts`: `401` solo para token ausente, mal formado, caducado, revocado o con audiencia inválida, y `503` para red, certificados, configuración o códigos desconocidos; verificar con `npx tsc --noEmit`
- [x] 2.2 Sustituir los mensajes internos por copy genérico y reportar el fallo con la ruta y el código del error, construyendo un error saneado que no incluya token ni cabecera `Authorization`; verificar buscando que el token no se registra
- [x] 2.3 Comprobar los códigos con un token alterado o caducado (`401`) y con el verificador sin salida a Google o sin configuración (`503`), confirmando que el cuerpo no filtra detalles internos

## 3. Recuperación de sesión en el cliente

- [x] 3.1 En `src/lib/api/authFetch.ts`, ante un `401` refrescar el token una sola vez con `getIdToken(true)` y repetir la petición; si vuelve a fallar, emitir `kanso:session-invalid` y lanzar un error tipado de sesión, sin llamar a `signOut`; verificar con `npx tsc --noEmit`
- [x] 3.2 Crear un `SessionGuard` dentro de `AuthProvider` que escuche el evento y muestre un `ErrorState` centrado con «Iniciar sesión de nuevo», enlace a `/login?mode=login&next=<ruta actual>` y limpieza al cambiar de usuario o al entrar en `/login`; verificar que el guard no aparece en la pantalla de acceso
- [ ] 3.3 Probar el ciclo completo: token caducado refrescado sin error, token revocado que muestra el estado de sesión, fallo de red que conserva la sesión y reautenticación que devuelve a la ruta original

## 4. Errores de pantalla centrados

- [x] 4.1 Centrar las variantes `page` y `panel` de `src/components/ErrorState.tsx` (icono, título, descripción y acciones), manteniendo `inline` como banner; verificar a 320, 768 y 2400 px en ambos temas
- [x] 4.2 Reutilizar `ErrorState` con `variant="page"` en `src/app/error.tsx` para que la frontera de error comparta el centrado y la acción de reintento, conservando el reporte a Sentry; verificar forzando un error de render en una ruta de prueba
- [ ] 4.3 Recorrer los errores de historial, recomendación, colección, detalle de álbum, novedades, artistas, amigos, biblioteca compartida y perfil público, comprobando centrado, ancho legible y ausencia de scroll horizontal

## 5. Copy amable en las pantallas

- [x] 5.1 En `useFriendsPage` y `useFriendLibrary`, dejar de guardar el mensaje crudo del servidor en el estado que se pinta: conservar un booleano o la clave traducida, registrar el error original en consola y usar el copy traducido en las pantallas
- [x] 5.2 Revisar `friends`, `friends/[uid]`, `f/[code]` y cualquier `description={error}` para que nunca rendericen el texto técnico de la API, manteniendo las acciones de reintento y las salidas existentes
- [ ] 5.3 Verificar que un error de API se ve con copy traducido en esas pantallas y que el detalle técnico sigue disponible en la consola o la monitorización

## 6. Integración y regresión

- [x] 6.1 Ejecutar `npx tsc --noEmit`, `npm run lint` y `npm run build` con el servidor de desarrollo parado, y comprobar que no hay errores nuevos
- [ ] 6.2 Recorrer las pantallas afectadas en tema claro y oscuro a 320, 390, 768, 1440 y 2400 px, verificando errores centrados, sesión inválida, reautenticación y copy sin mensajes técnicos
- [x] 6.3 Validar el cambio con `npx openspec validate harden-error-and-session-states --strict` y confirmar que los deltas siguen siendo compatibles con los cambios en curso

## Workflow follow-up

- Archivar en cualquier orden respecto a `polish-visual-consistency` y los cambios de layout: los requisitos nuevos tienen nombre propio y no reescriben los existentes.
- Al archivar, revisar que `authentication`, `api-security` y `error-monitoring` recogen los requisitos nuevos sin duplicar los ya existentes.
