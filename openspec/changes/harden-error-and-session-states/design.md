# Design

## Context

Ver `proposal.md` para la motivación y `specs/` para el contrato de comportamiento.

Estado actual relevante:

- `src/lib/apiAuth.ts` envuelve `verifyIdToken` en un `catch {}` y devuelve siempre `401` con «Token de autenticación inválido.». No distingue token caducado de un fallo de red, certificados o configuración, y no registra el error real.
- `src/lib/api/authFetch.ts` adjunta el token cacheado y nunca lo refresca ni reintenta. Cualquier `401` llega a la pantalla como error genérico.
- `src/components/ErrorState.tsx` alinea a la izquierda las variantes `page` y `panel`; solo `global-error.tsx` está centrado. `src/app/error.tsx` también está a la izquierda.
- Varias pantallas (`friends`, `friends/[uid]`, `f/[code]`) pintan `loadFailure.message` o `requestFailure.message`, que puede ser el texto técnico de la API.
- El proyecto no tiene una ruta o proveedor que centralice un estado de sesión inválida.

## Goals / Non-Goals

**Goals:**

- Que un fallo de red no se disfrace de token inválido ni expulse a la persona.
- Una sola política de recuperación de sesión, aplicada en el punto por el que pasan todas las peticiones autenticadas.
- Que los errores de pantalla compartan el centrado de los estados vacíos, sin convertir los errores inline en bloques centrados.
- Que ningún mensaje técnico del servidor llegue a la interfaz.

**Non-Goals:**

- Cambiar el flujo de registro, Google o invitado.
- Introducir refresh tokens propios o sesiones de servidor.
- Reintentar automáticamente errores `5xx` que no sean de verificación.
- Unificar el copy de todas las pantallas en un único componente de error: cada pantalla conserva su título y su acción.

## Decisions

### 1. Centrado de errores en `ErrorState`

Las variantes `page` y `panel` pasan a un layout centrado (`mx-auto`, `text-center`, icono centrado y acciones en `justify-center`), con su ancho máximo actual. La variante `inline` no cambia: sigue siendo un banner dentro de formularios y subsecciones. `src/app/error.tsx` reutiliza `ErrorState` con `variant="page"` y `onRetry={reset}` para heredar el mismo lenguaje visual y el mismo centrado, manteniendo el reporte a Sentry.

- **Alternativa descartada:** aplicar `.kanso-empty` a `ErrorState`. La clase está pensada para vacíos y no cubre icono, acciones ni el rol de alerta; además acoplaría dos capacidades.

### 2. Clasificación de errores de verificación

En `apiAuth.ts`, un fallo de `verifyIdToken` se clasifica por código:

```
401  token ausente, mal formado, caducado, revocado o con audiencia inválida
503  error de red, de obtención de certificados, de configuración del verificador
     o cualquier fallo no reconocido como token inválido
```

La lista de códigos que producen `401` es explícita; todo lo demás cae en `503`. El cuerpo lleva mensajes genéricos («Tu sesión no es válida» / «No pudimos validar tu sesión. Inténtalo de nuevo.»), sin códigos ni trazas.

- **Alternativa descartada:** devolver siempre `401`. Es lo que provoca el fallo actual: el cliente cree que la sesión es inválida y no puede distinguir un problema reintentable.
- **Alternativa descartada:** devolver siempre `503`. Un token realmente inválido dejaría a la persona reintentando sin llegar nunca a la reautenticación.

### 3. Refresco único y estado de sesión global

`authFetch` construye la petición con el token actual. Si recibe `401` y hay usuario:

1. Llama a `getIdToken(true)` una sola vez.
2. Repite la petición con el token nuevo.
3. Si vuelve a recibir `401`, emite un evento `kanso:session-invalid` y lanza un `SessionInvalidError`.

Un componente `SessionGuard` montado dentro de `AuthProvider` escucha el evento y sustituye el contenido por un `ErrorState` centrado con la acción «Iniciar sesión de nuevo», que enlaza a `/login?mode=login&next=<ruta actual>`. No se llama a `signOut()`.

El guard se desactiva en `/login` y se limpia cuando cambia el usuario autenticado o cuando un refresco posterior tiene éxito, para que la reautenticación no quede bloqueada por el propio guard.

- **Alternativa descartada:** cerrar sesión y redirigir automáticamente. Un fallo de red o del verificador expulsaría a personas con sesión válida.
- **Alternativa descartada:** manejar el `401` en cada hook. Duplicaría la política y olvidaría rutas nuevas.

### 4. Copy amable y crudo solo en diagnóstico

Los hooks dejan de guardar el mensaje del servidor en el estado que se pinta. Guardan un booleano o una clave de traducción y registran el error original con `console.error`/monitorización. Las pantallas de amigos, biblioteca compartida y perfil público usan siempre su copy traducido; los mensajes específicos que ya existen como claves (`requestError`, `removeErrorMessage`, etc.) se conservan.

- **Alternativa descartada:** mapear cada mensaje del servidor a copy. Acopla la UI a textos internos y vuelve a filtrar detalles.

### 5. Reporte saneado

`authenticate()` reporta el fallo con la ruta y el código del error, construyendo un error nuevo con esos dos datos. Nunca pasa a la monitorización la cabecera `Authorization`, el token ni el objeto de error original si puede contenerlos. Si la monitorización no está configurada, la respuesta no cambia.

## Risks / Trade-offs

- **Un `401` legítimo tras el refresco muestra el estado de sesión en toda la app** → Es el comportamiento buscado; la acción de reautenticación es explícita y conserva la ruta.
- **El guard puede bloquear `/login`** → Se desactiva en esa ruta y se limpia al cambiar el usuario; verificar el ciclo completo de reautenticación.
- **Centrar `panel` puede descolocar errores que hoy se leen como parte de una sección** → Revisar las pantallas que lo usan; las acciones inline siguen siendo banners.
- **La lista de códigos de Firebase Admin puede cambiar** → El valor por defecto es `503` (reintentable), que es el lado seguro; los códigos desconocidos no expulsan a nadie.
- **El refresco añade una petición extra ante un `401` real** → Solo ocurre una vez por petición y evita mostrar un error cuando el token solo había caducado.
- **Los mensajes genéricos pierden detalle para soporte** → El detalle queda en consola y monitorización, asociado a la ruta.

## Migration Plan

No hay migración de datos ni cambios de contrato más allá de los códigos `401`/`503`. Se despliega con el frontend y la API en el mismo release:

1. Clasificación y logging en `apiAuth`.
2. Refresco y `SessionGuard` en el cliente.
3. Centrado de `ErrorState` y `error.tsx`.
4. Copy amable en amigos, biblioteca compartida y perfil público.
5. Rollback: revertir el commit; no hay estado persistido.

## Open Questions

Ninguna.
