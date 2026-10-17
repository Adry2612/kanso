# Tasks

## 1. Distinguir "sin coincidencias" de error técnico

- [x] 1.1 En `src/lib/api/recomendation.ts`, hacer que `getRecomendacion`/`getRecomendation` devuelva `null` ante un `404` (sin coincidencias) y siga lanzando en el resto de fallos; verificar con `npx tsc --noEmit` que el tipo de retorno admite `null`
- [x] 1.2 En `src/app/home/pages/RecomendationPage.tsx`, separar el estado "sin resultado" (`null`) del error técnico (excepción) en el flujo por emoción; verificar manualmente/por lectura que un 404 ya no cae en el bloque de error

## 2. Estado vacío accionable

- [x] 2.1 Añadir textos del estado vacío a `src/locales/es.json` y `src/locales/en.json` (namespace `recommendation`); verificar que las claves existen en ambos idiomas
- [x] 2.2 Rediseñar el bloque sin coincidencias en `RecomendationPage`: titular, chips con las emociones elegidas (`getMood`/`tMoods`), CTA principal a `/search` y acción secundaria "Volver a elegir"; usar `Reveal`/superficie coherente con el resto
- [x] 2.3 Mantener un bloque de error técnico diferenciado con `role="alert"`; verificar que no se muestra el estado vacío ante un fallo de red

## 3. Verificación de integración

- [x] 3.1 Ejecutar `npx tsc --noEmit`, `npm run lint` sin errores nuevos y `npm run build` completando correctamente
- [ ] 3.2 Prueba manual: elegir una emoción sin álbumes coincidentes → aparece el estado vacío con las emociones y el botón lleva a `/search`; simular un fallo de red → aparece el error técnico

## Workflow follow-up

- Archivar el change tras la revisión del usuario.
- Verificar el resultado archivado.
