# Tasks

## 1. Endpoint de búsquedas de la comunidad

- [x] 1.1 Crear `src/app/api/communitySearches/route.ts` con `POST` (valida no vacío, limita longitud, normaliza y agrega con `increment` + `serverTimestamp` en la colección `communitySearches`) y `GET` (últimas N por `lastAt`); verificar con `npx tsc --noEmit`
- [x] 1.2 Verificar por lectura que ningún documento guarda identificador de usuario

## 2. Registro desde la búsqueda

- [x] 2.1 En `src/app/search/page.tsx`, registrar el término cuando se ejecuta una búsqueda no vacía (sin bloquear la UI ante fallo); verificar que no se registra en cada pulsación ni con consulta vacía

## 3. Sección de la comunidad en el estado inicial

- [x] 3.1 Añadir a `src/locales/es.json` y `src/locales/en.json` (namespace `search`) el título y los textos de la sección de la comunidad
- [x] 3.2 Mostrar en el estado inicial una sección con las últimas búsquedas de la comunidad; al pulsar una, establecer la consulta; si está vacía o falla, no mostrarla ni romper la pantalla

## 4. Verificación de integración

- [x] 4.1 Ejecutar `npx tsc --noEmit`, `npm run lint` sin errores nuevos y `npm run build` completando correctamente
- [x] 4.2 Prueba manual: realizar varias búsquedas desde cuentas/sesiones distintas y comprobar que aparecen en el inicio de otro usuario; pulsarlas establece la consulta; sin datos, la sección no aparece

## Workflow follow-up

- Archivar el change tras la revisión del usuario.
- Verificar el resultado archivado.
