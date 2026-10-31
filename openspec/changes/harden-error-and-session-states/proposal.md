# Proposal

## Why

Un fallo de verificación del token —incluido un problema de red o DNS— se presenta hoy como «Token de autenticación inválido» y deja la aplicación sin datos, con un botón de reintentar que repite el mismo fallo. Además, los estados de error de pantalla siguen alineados a la izquierda, a diferencia de los estados vacíos, y algunas pantallas muestran el mensaje técnico que devuelve la API.

## What Changes

- **Estados de error centrados**: los errores de pantalla (`ErrorState` en variantes `page` y `panel`) y la frontera `app/error.tsx` se centran en el área de contenido, con icono, título, descripción y acciones centrados. Los errores `inline` de formularios y subsecciones conservan su formato de banner para no romper el contexto donde aparecen.
- **Clasificación correcta del fallo de sesión**: la API devuelve `401` solo cuando el token es realmente inválido o falta; los fallos de verificación por red, certificados o configuración del verificador devuelven `503` reintentable. El mensaje al cliente es genérico; el detalle real se registra en el servidor sin incluir el token.
- **Recuperación de sesión**: `authFetch` refresca el token una vez (`getIdToken(true)`) y reintenta ante un `401`. Si el segundo intento también falla, la app muestra un estado de sesión centrado con la acción «Iniciar sesión de nuevo», sin cerrar la sesión automáticamente para no expulsar a una persona con sesión válida cuando el problema es de red.
- **Mensajes amables en todas las pantallas**: las pantallas que hoy pintan el mensaje crudo del servidor (`friends`, `friends/[uid]`, `f/[code]`) pasan a usar copy traducido y un estado de error con acción, sin filtrar detalles internos.

## Capabilities

### New Capabilities

- `error-states`: presentación y recuperación de errores de pantalla, incluido el estado de sesión no validada y la frontera de error de ruta.

### Modified Capabilities

- `api-security`: distinguir token inválido (`401`) de verificador no disponible (`503`) y no devolver detalles internos al cliente.
- `authentication`: refrescar el token una vez ante un rechazo y ofrecer reautenticación manual cuando la sesión no se puede validar.
- `error-monitoring`: reportar los fallos de verificación de identidad con contexto suficiente y sin credenciales.

## Impact

- Componentes y fronteras: `src/components/ErrorState.tsx`, `src/app/error.tsx`.
- Cliente: `src/lib/api/authFetch.ts`, servicios que propagan mensajes (`src/services/client/friends.ts`, hooks de amigos y biblioteca compartida).
- Servidor: `src/lib/apiAuth.ts` (clasificación, logging y mensajes), `src/lib/sentry.ts` si hace falta un contexto nuevo.
- Pantallas: historial, recomendación, colección, detalle de álbum, novedades, artistas, amigos, biblioteca compartida, perfil público y login.
- Sin cambios de datos, dependencias ni contratos de guardado. Los códigos `401`/`503` son parte del contrato de la API y se documentan en el spec.
