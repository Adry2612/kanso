# Proposal

## Why

El proyecto arrastra restos de una etapa anterior que ensucian y confunden:

- Rutas y componentes **sin uso**: `/home/mood`, `/home/activity`, `/home/recommendation`, `/home/recommendation-result`, `GridSelector`, `LanguageSwitcher`, `heartButton` y `src/lib/recomendations/recomendations.ts`. Son dos flujos de recomendación antiguos que conviven con el actual y despistan a quien lee el código.
- **36 warnings de lint** acumulados (imports y variables sin usar, `any`, dependencias de hooks, `<img>`), que tapan los avisos que sí importan.

## What Changes

- **Borrar** las rutas y componentes muertos y el tipo `HeartButtonProps`, que solo usaba `heartButton`.
- **Arreglar los warnings de lint**: quitar imports y variables sin usar, sustituir `any` por tipos concretos, corregir dependencias de hooks y resolver los `<img>`.

Se **conservan** a propósito: `/recomendation` (redirección deliberada de la URL antigua a `/recommendation`) y el andamiaje de next-intl (`src/i18n.ts` lo carga `next.config`; `src/i18n/routing.ts` se deja para `enable-language-switching`).

## Capabilities

Sin cambios de comportamiento: no hay deltas de spec. Es una limpieza de código.

## Impact

- Ficheros borrados: `src/app/home/mood/`, `src/app/home/activity/`, `src/app/home/recommendation/`, `src/app/home/recommendation-result/`, `src/app/home/components/GridSelector.tsx`, `src/components/LanguageSwitcher.tsx`, `src/components/heartButton.tsx`, `src/lib/recomendations/`.
- Ficheros con ajustes de lint: ~16 (rutas de API, páginas y utilidades).
- Sin cambios de datos, API ni interfaz visible.
