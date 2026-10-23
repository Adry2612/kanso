# Proposal

## Why

La app ha crecido con la lógica de negocio repartida entre páginas, componentes y rutas de API: varias vistas superan las 500 líneas, hacen `fetch` directo y concentran decenas de `useState`/`useEffect`; las rutas mezclan autenticación, validación, Firestore y respuesta HTTP; y algunos tipos y cálculos están duplicados. Además, el detalle de álbum importa desde el cliente un servicio de Spotify que usa credenciales de servidor. Esto hace que cada cambio sea más arriesgado y difícil de revisar.

Las reglas de `.agents/architecture-rules.md` establecen una separación clara entre vistas, hooks headless, servicios, utilidades y tipos. Después de cerrar la funcionalidad de «Por escuchar», es el momento de aplicar esas reglas de forma incremental, sin cambiar el comportamiento visible ni los contratos de la API.

## What Changes

- **Fronteras de capas explícitas.** Las vistas y componentes quedan como marcado y composición; los hooks concentran estado, efectos y handlers; los servicios concentran toda comunicación externa; las utilidades contienen funciones puras; los tipos son la fuente única de las estructuras de datos.
- **Servicios de cliente y de servidor.** Las llamadas a la API interna, Firebase Auth y Spotify/Firestore se encapsulan en servicios dedicados. Las rutas de `src/app/api/**` pasan a ser adaptadores HTTP finos sobre servicios de servidor.
- **Hooks headless por pantalla y por flujo.** Se extraen hooks para Favoritos, detalle de álbum, asistente de guardado, búsqueda, artistas, novedades, amigos, historial, inicio, login, ajustes y componentes con lógica (Header, carruseles, modales y notifier).
- **Utilidades puras y tipos compartidos.** Se centralizan filtros, ordenaciones, agrupaciones, normalización de etiquetas, fechas, color, tracklists, parámetros de recomendación y reglas de amistad; se eliminan duplicados como `Album`/`SpotifyAlbum`, `Track`, `HistoryItem` y `Tag`.
- **Corrección de la frontera cliente/servidor.** El detalle de álbum deja de importar `services/spotify.ts` desde el navegador y pasa por un servicio de cliente y una ruta de servidor.
- **Guardarraíles de arquitectura.** Se añaden marcas `server-only`, reglas de importación en ESLint, Tipos estrictos en los módulos tocados y documentación de la estructura objetivo.
- **Migración incremental por cortes verticales.** Primero Favoritos como patrón de referencia, después detalle de álbum y asistente, búsqueda/artistas/novedades/comunidad, amigos, servicios de colección/recomendaciones, y finalmente autenticación/ajustes/Header.
- **Sin cambios de comportamiento.** Se conservan las respuestas de la API, las rutas, los datos y la experiencia de usuario. Los specs existentes y la colección Bruno son el contrato de regresión.

## Capabilities

### New Capabilities

Ninguna. Es un refactor puro de implementación: no cambia el comportamiento observable ni los contratos de la API.

### Modified Capabilities

Ninguna. Las capacidades existentes (`album-collection`, `album-detail`, `album-search`, `listen-later`, `recommendations`, `friends`, `friend-library`, `authentication`, `api-security`, etc.) se mantienen como contrato de regresión y no requieren deltas.

El cambio declara `skip_specs: true` en `.openspec.yaml`.

## Impact

- **Páginas y componentes:** `src/app/**/page.tsx`, `src/app/home/pages/**`, `src/components/**`, `src/app/search/components/SelectedAlbumModal/**`.
- **Hooks:** nuevos hooks de pantalla, de acciones asíncronas y de UI en `src/hooks`.
- **Servicios:** nueva separación `src/services/client/**` y `src/services/server/**`; migración de `src/lib/api/**`, `services/spotify.ts`, `src/lib/friends.ts`, `src/lib/friendLibrary.ts` y la lógica de Firestore de las rutas.
- **Utilidades y tipos:** `src/utils/**`, `src/types/**`, `models/album.ts` y tipos locales duplicados.
- **Rutas API:** los 29 `route.ts` se reducen a autenticación, validación de entrada y adaptación HTTP; no cambian sus respuestas.
- **Configuración:** `tsconfig.json` (alias de servicios), `eslint.config.mjs` (fronteras de importación) y documentación de arquitectura.
- **Sin migraciones de datos, sin nuevas dependencias de producto y sin cambios de UI.**

## Fuera de alcance

- Rediseñar pantallas, cambiar textos, flujos o comportamiento visible.
- Cambiar contratos de API, esquemas de Firestore o reglas de seguridad.
- Introducir nuevas funcionalidades o sustituir React Query/Next.js.
- Crear una suite completa de tests o CI; la verificación se apoya en TypeScript, ESLint, build, Bruno y pruebas manuales de los flujos críticos.
- Refactorizar en paralelo las rutas de `report-api-errors` o los componentes de `fix-mobile-viewport` mientras esos cambios sigan activos.
