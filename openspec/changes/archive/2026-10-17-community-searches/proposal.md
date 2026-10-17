# Proposal

## Why

La pantalla inicial de búsqueda solo propone emociones y etiquetas de **tu propia** colección. No hay ninguna señal de la comunidad, así que la pantalla se siente estática y no ayuda a descubrir música nueva fuera de lo que ya tienes. La persona ha pedido ver las últimas búsquedas de la comunidad antes de buscar.

## What Changes

- Registrar de forma **anónima** cada término buscado, agregándolo por término (término + veces + última fecha), sin guardar ninguna identidad de usuario.
- Mostrar en el estado inicial de `/search` una sección con las últimas búsquedas de la comunidad; al pulsar una, se establece como consulta.
- Endpoint para registrar (`POST`) y listar (`GET`) las búsquedas de la comunidad.

Fuera de alcance: moderación avanzada, ranking por popularidad como UI propia (los datos lo permiten a futuro) y cualquier dato personal.

## Capabilities

### New Capabilities

- `community-searches`: registro anónimo y agregado de términos de búsqueda, y su presentación en el estado inicial de la búsqueda.

### Modified Capabilities

- Ninguna (el estado inicial sigue mostrando las sugerencias de la colección; esta sección se añade sin cambiar esa parte).

## Impact

- Nuevas rutas API: `src/app/api/communitySearches/route.ts` (`GET`, `POST`).
- Nueva colección Firestore `communitySearches` (un documento por término normalizado).
- `src/app/search/page.tsx` (registrar al buscar y mostrar la sección).
- `src/locales/es.json`, `src/locales/en.json` (namespace `search`).
- Nota de seguridad: el `POST` escribe agregados públicos (sin datos de usuario); su endurecimiento (escritura solo desde servidor con Admin SDK y reglas) se aborda en el change `secure-api-and-firestore`.
