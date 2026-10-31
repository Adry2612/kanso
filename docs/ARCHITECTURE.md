# Arquitectura frontend

Este proyecto aplica separación de responsabilidades y el patrón de hook headless descrito en `.agents/architecture-rules.md`.

## Capas

| Capa                  | Ubicación                                      | Responsabilidad                                                     | Puede importar                                   |
| --------------------- | ---------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------ |
| Vistas                | `src/app/**/page.tsx`, `src/app/**/layout.tsx` | Composición de hooks, providers y componentes                       | Hooks, componentes, tipos, utils                 |
| Componentes           | `src/components/**`                            | Marcado, estilos y accesibilidad; sin IO ni lógica de negocio       | Hooks de UI, tipos, componentes                  |
| Hooks                 | `src/hooks/client/**`, `src/hooks/ui/**`       | Estado, efectos, handlers y coordinación de servicios               | Servicios de cliente, utils, tipos               |
| Servicios de cliente  | `src/services/client/**`                       | Llamadas a la API interna y Firebase Auth de cliente                | `fetch`, Firebase Auth, tipos                    |
| Servicios de servidor | `src/services/server/**`                       | Firestore, Spotify y otros servicios externos                       | `lib/firebaseAdmin`, `lib/apiAuth`, utils, tipos |
| Rutas API             | `src/app/api/**/route.ts`                      | Adaptador HTTP: autenticar, validar, llamar al servicio y responder | `lib/apiAuth`, servicios de servidor, tipos      |
| Utilidades            | `src/utils/**`                                 | Funciones puras: filtros, ordenaciones, fechas, color, transforms   | Tipos y constantes                               |
| Tipos                 | `src/types/**`                                 | Fuente única de estructuras de datos                                | Solo tipos                                       |
| Infraestructura       | `src/lib/**`                                   | Firebase, Sentry, guards de autenticación                           | Librerías de infraestructura                     |

## Dirección de dependencias

```text
app/**/page.tsx + components/**
        ↓
hooks/**
        ↓
services/client/**
        ↓
API interna (src/app/api/**)

app/api/**/route.ts
        ↓
services/server/**
        ↓
Firestore / Spotify / servicios externos
```

Reglas:

- Una vista o componente nunca llama a `fetch`/`authFetch`, Firebase ni Firestore.
- Un hook de cliente nunca importa `services/server/**`, `firebase-admin`, `lib/firebaseAdmin` ni `lib/apiAuth`.
- Un servicio de servidor empieza con `import "server-only"`.
- Una ruta API no usa `adminDb()` directamente.
- `utils/**` no importa React, servicios ni `lib/**`.
- `types/**` no importa código en tiempo de ejecución.

Estas reglas se comprueban con `npm run lint` (reglas `no-restricted-imports`).

## Añadir una pantalla nueva

1. Define los tipos de entrada/salida en `src/types/`.
2. Crea o amplía el servicio de cliente en `src/services/client/`.
3. Crea el hook de pantalla en `src/hooks/client/` con carga, error, acciones y estado.
4. Crea los componentes presentacionales en `src/components/` o junto a la ruta.
5. Deja `src/app/**/page.tsx` como composición del hook y los componentes.
6. Si hace falta un dato nuevo, crea la ruta en `src/app/api/**/route.ts` y mueve la lógica a `src/services/server/`.
7. Verifica con:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Colección

- La colección vive en `users/{uid}/collection` y se sirve con `GET`, `POST` y
  `DELETE /api/collection`; las rutas solo autentican, validan y delegan en
  `src/services/server/collection`.
- Las pantallas de colección e historial comparten las primitivas de
  `src/components/gallery/`.
- Durante el renombrado desde `users/{uid}/favorites`, el repositorio combina
  ambas rutas con lectura dual y escribe siempre en la nueva. La migración se
  ejecuta con `npm run migrate:collection:dry` y `npm run migrate:collection`;
  cuando los recuentos cuadran, se retira la lectura heredada.

## Instalación como aplicación

- `public/manifest.webmanifest` declara la app como Kanso con `start_url: "/"`,
  `display: "standalone"`, colores de tema y el logo en 192 y 512 px.
- `src/app/layout.tsx` enlaza el manifiesto y añade los metadatos de app iOS
  (`appleWebApp`), de modo que al abrirla desde el icono instalado no aparezcan
  la barra de rutas ni los botones del navegador.
- No hay service worker: la app instalada sigue necesitando red. En una pestaña
  normal el navegador conserva su chrome; ocultarlo solo es posible en modo
  `standalone`.

## Refactor incremental

El cambio `refactor-frontend-architecture` migra la app por cortes verticales. Mientras dure:

- no se cambian contratos de API ni comportamiento visible;
- cada fase deja `tsc`, `lint` y `build` en verde;
- las rutas de `report-api-errors` y los componentes de `fix-mobile-viewport` no se tocan hasta archivar esos cambios.
