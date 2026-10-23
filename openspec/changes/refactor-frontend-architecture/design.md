# Design

## Context

Ver `proposal.md` — Why. El estado actual relevante para el diseño es:

- `src/app/**/page.tsx` y varios componentes hacen `fetch`/`authFetch`, manejan estado y ejecutan cálculos. Hay páginas de 500–742 líneas y hasta 18 `useState` y 8 `useEffect`.
- `src/app/api/**/route.ts` mezcla autenticación, validación, acceso a Firestore/Spotify y construcción de la respuesta.
- `src/lib` es una carpeta catch-all: infraestructura, servicios de servidor, helpers puros y utilidades de cliente. `src/lib/api` ya es un buen embrión de servicios de cliente.
- `services/spotify.ts` vive fuera de `src`, usa credenciales de servidor y se importa desde una página `"use client"`.
- Los tipos están repartidos entre `models/album.ts`, `src/types/*`, `src/lib/api/*`, `src/lib/friendLibrary.ts` y tipos locales de las páginas.
- `tsconfig.json` tiene dos aliases que apuntan a árboles distintos: `@/* → ./src/*` y `@/services/* → ./services/*`.
- No hay reglas de frontera de importación en ESLint, ni tests automatizados; Bruno es el contrato de API.
- `report-api-errors` y `fix-mobile-viewport` están activos y tocan rutas, Header y modales.

## Goals / Non-Goals

**Goals:**

- Hacer explícitas las cinco capas de `.agents/architecture-rules.md` y una única dirección de dependencias.
- Establecer un patrón repetible con un corte vertical completo antes de extenderlo al resto de la app.
- Corregir la fuga cliente/servidor de Spotify sin cambiar la pantalla de detalle.
- Preservar el comportamiento y los contratos existentes, verificables con los specs actuales y Bruno.
- Dejar guardarraíles que impidan volver a mezclar capas.

**Non-Goals:**

- Cambiar la UI, los textos, las rutas, los esquemas de Firestore o las respuestas de la API.
- Introducir una librería nueva de data-fetching, un rediseño o una migración de datos.
- Refactorizar a la vez las rutas de `report-api-errors` o los componentes de `fix-mobile-viewport`.
- Crear una suite completa de tests o CI en este cambio.

## Decisions

### 1. Estructura objetivo: servicios explícitos cliente/servidor

Se adopta la Opción A del análisis: `src/services/client/**` y `src/services/server/**`.

```
src/
  app/**/page.tsx            # composición: hook + componentes presentacionales
  app/api/**/route.ts        # adaptador HTTP: auth -> validación -> servicio -> respuesta
  components/**              # presentacional, sin IO ni lógica de negocio
  hooks/
    client/**                # estado/efectos/handlers de pantallas y flujos
    ui/**                    # carruseles, foco, scroll, sidebar, debounce
  services/
    client/**                # navegador -> API interna / Firebase Auth
    server/**                # servidor -> Firestore, Spotify, servicios externos
  utils/**                   # funciones puras, sin React, IO ni env
  types/**                   # fuente única de tipos
  lib/**                     # solo infraestructura (Firebase, Sentry, auth guards)
```

**Por qué:** hace visible qué código puede cruzar al navegador y permite aplicar `server-only`. **Alternativa considerada:** mantener `src/lib/api` como capa de servicios y añadir solo `src/services/server`. Se descarta porque deja dos nombres para la misma capa y no resuelve la ambigüedad de `src/lib`.

### 2. Una sola dirección de dependencias

- `app/**/page.tsx` y `components/**` dependen de `hooks/**`, `types/**` y componentes presentacionales.
- `hooks/client/**` depende de `services/client/**`, `utils/**` y `types/**`.
- `services/client/**` solo habla con la API interna y Firebase Auth; nunca importa `services/server/**`, `firebase-admin` ni `lib/apiAuth`.
- `services/server/**` puede usar `services/server/**`, `lib/firebaseAdmin`, `lib/apiAuth`, `utils/**` y `types/**`; empieza con `import "server-only"`.
- `utils/**` solo depende de `types/**` y `constants/**`; no importa React, servicios ni `lib`.
- `types/**` no importa código en tiempo de ejecución.
- Las rutas API no usan `adminDb()` directamente: llaman a un servicio de servidor.

**Por qué:** la dirección única evita ciclos y permite razonar sobre qué se bundlea. **Alternativa considerada:** confiar en convenciones y revisión manual. Se descarta porque el proyecto ya tiene una fuga real y no hay reglas que la impidan.

### 3. Hooks headless, no una nueva librería de datos

Los hooks de pantalla encapsulan `useState`, `useEffect`, `useReducer`, handlers y coordinación de servicios. Se mantiene React Query donde ya se usa (detalle de álbum) y se usan hooks explícitos con estado de carga/error/abort para el resto, en lugar de introducir una migración global a React Query.

**Por qué:** preserva el comportamiento actual y reduce el riesgo del refactor. **Alternativa considerada:** migrar todo a React Query. Se descarta porque cambia semántica de caché, reintentos y revalidación, y mezcla un cambio de arquitectura con uno de gestión de datos.

### 4. Servicios de servidor y repositorios

Cada dominio tiene un servicio de servidor (`collectionService`, `listenLaterService`, `recommendationService`, `friendService`, `artistService`, `communityService`, `profileService`) y, cuando aporta claridad, un repositorio para Firestore. El servicio orquesta reglas y transacciones; el repositorio encapsula consultas y escrituras.

Los route handlers quedan como:

1. autenticar y autorizar,
2. validar el payload/query,
3. llamar al servicio,
4. mapear el resultado a la respuesta HTTP existente.

**Por qué:** permite reutilizar lógica entre rutas (favoritos/pendientes, amigos/notificaciones) y testear sin HTTP. **Alternativa considerada:** dejar la lógica en las rutas y solo mover tipos. Se descarta porque no cumple la regla de servicios y mantiene el acoplamiento actual.

### 5. Utilidades puras y tipos canónicos

- `utils/**` concentra filtros, ordenaciones, agrupaciones, normalización de etiquetas, fechas, color, tracklists, releases, historial, parámetros de recomendación y reglas de amistad.
- `types/**` es la fuente única. `models/album.ts` se sustituye por `types/album.ts`; `types/spotify.ts` se reorganiza como tipos de proveedor; los tipos locales de páginas y los tipos exportados por servicios se mueven a `types/**`.
- Las funciones de fecha reciben locale o usan una utilidad común, en vez de hardcodear `es-ES`.

**Por qué:** elimina duplicados y permite reutilizar en cliente y servidor. **Alternativa considerada:** dejar tipos junto a cada servicio. Se descarta porque ya hay shapes duplicados y castings a `any`.

### 6. Frontera cliente/servidor de Spotify

`services/spotify.ts` se mueve a `src/services/server/spotify.ts` y se marca `server-only`. El detalle de álbum usa un servicio de cliente que llama a una ruta de servidor existente o nueva; nunca importa el servicio de servidor. Se mantiene la hidratación de React Query y la ruta de layout que ya prefetchea.

**Por qué:** elimina el riesgo de credenciales y código Node en el bundle de cliente. **Alternativa considerada:** dejar la llamada directa y confiar en que Next.js no bundlee las credenciales. Se descarta porque el import ya existe y el contrato de la regla es explícito.

### 7. Guardarraíles sin añadir dependencias de arquitectura

- `import "server-only"` en servicios de servidor y módulos de infraestructura sensibles.
- Reglas `no-restricted-imports` de ESLint con `overrides` por grupo de ficheros para impedir que cliente importe servidor y que `utils`/`types` importen capas superiores.
- `@typescript-eslint/no-explicit-any` a `error` en `src/services/**`, `src/hooks/**`, `src/utils/**` y `src/types/**`; el resto se endurece al tocar cada módulo.
- Un alias único: se elimina el alias `@/services/*` que apunta al `services/` raíz y se usa `@/*` para `src/**`.
- Documento corto de arquitectura con la tabla de dependencias permitidas.

**Por qué:** convierte las reglas en algo verificable sin introducir `eslint-plugin-boundaries`. **Alternativa considerada:** añadir un plugin de fronteras. Se descarta por ahora para no sumar dependencias y porque `no-restricted-imports` cubre los casos conocidos.

### 8. Orden de migración por cortes verticales

1. Guardarraíles, tipos y decisión de alias.
2. Frontera crítica de detalle de álbum.
3. Favoritos + Por escuchar como patrón de referencia (servicios, hooks, utils, componentes).
4. Detalle de álbum y asistente de guardado.
5. Búsqueda, artistas, novedades y comunidad.
6. Amigos y biblioteca compartida.
7. Servicios de colección, recomendaciones e inicio/historial.
8. Autenticación, ajustes y Header/providers.
9. Endurecimiento final y limpieza.

**Por qué:** cada corte es verificable y reversible; Favoritos ya tiene hooks y utilidades embrionarias. **Alternativa considerada:** migración big-bang. Se descarta por el riesgo y porque impide revisar el patrón antes de repetirlo.

## Risks / Trade-offs

- **Regresiones invisibles por mover lógica sin tests** → Cada fase mantiene los contratos y se verifica con `tsc`, `lint`, `build`, Bruno y una matriz manual de flujos críticos. No se cambia comportamiento en la misma fase que se mueve código.
- **Conflictos con `report-api-errors` en las rutas** → No empezar la extracción de servicios de servidor hasta que ese cambio esté archivado, o limitar la fase a lectura sin tocar `route.ts`.
- **Conflictos con `fix-mobile-viewport` en Header y modales** → Posponer la extracción de `Header`, `ModalShell` y modales hasta que ese cambio esté archivado.
- **Doble fuente de verdad durante la migración** → Usar re-exports temporales y eliminar cada duplicado en la misma fase en que se migra su consumidor.
- **`server-only` puede romper imports existentes** → Añadirlo primero a módulos ya exclusivos de servidor y ejecutar `tsc`/`build` tras cada grupo; si un módulo se usa en cliente, extraer primero el servicio de cliente.
- **El alias `@/services/*` puede quedar apuntando al árbol antiguo** → Eliminarlo al mover `services/spotify.ts` y verificar que no quedan imports.
- **Refactor largo con deriva de alcance** → El cambio se limita a mover y tipar; cualquier mejora funcional se convierte en otro cambio OpenSpec.

## Migration Plan

- Implementar por fases y commits pequeños; cada fase debe dejar `tsc`, `lint` y `build` en verde.
- Fase 0 no cambia runtime: solo tipos, alias y guardarraíles.
- La fase crítica de Spotify se despliega antes de continuar con las páginas.
- Cada fase conserva las respuestas de API y se contrasta con Bruno; si una respuesta cambia, se revierte la fase.
- Rollback: revertir el commit de la fase. No hay migración de datos ni feature flags.
- Al terminar, actualizar la documentación de arquitectura y archivar el cambio.

## Open Questions

Ninguna que bloquee el diseño. La elección exacta de nombres de hooks o repositorios puede ajustarse durante la implementación sin cambiar el enfoque ni las tareas.
