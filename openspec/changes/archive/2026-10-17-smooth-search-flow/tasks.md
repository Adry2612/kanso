# Tasks

## 1. Registro sano de búsquedas de la comunidad

- [x] 1.1 En `src/app/search/page.tsx`, separar el registro del debounce de resultados: registrar el término solo tras una pausa mayor (p. ej. 1.5 s), con un mínimo de 3 caracteres, sin repetir el mismo término consecutivo de la sesión y sustituyendo el prefijo parcial por el término definitivo (enviando `previousTerm`)
- [x] 1.2 Normalizar el término (minúsculas y espacios colapsados) al guardarlo en `src/app/api/communitySearches/route.ts` y al mostrarlo en el `GET`
- [x] 1.3 En `POST /api/communitySearches`, aceptar `previousTerm` y eliminar el documento del parcial cuando el término nuevo lo extiende

## 2. Resultados sin obsolescencia

- [x] 2.1 En `src/app/search/page.tsx`, usar `AbortController` para cancelar la búsqueda anterior al iniciar una nueva y descartar `AbortError`
- [x] 2.2 Recortar la consulta (`trim`) antes de decidir si hay búsqueda

## 3. Verificación de integración

- [x] 3.1 Ejecutar `npx tsc --noEmit`, `npm run lint` sin errores nuevos y `npm run build` completando correctamente
- [x] 3.2 Prueba manual: escribir "extremoduro" de seguido → se registra una sola vez y normalizado; pausar en "extre" y continuar → el parcial se sustituye; escribir rápido dos consultas → solo se muestran los resultados de la última
