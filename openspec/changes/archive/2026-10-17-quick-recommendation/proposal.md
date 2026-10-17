# Proposal

## Why

Para recibir una recomendación hay que elegir una emoción (o una actividad) y luego el formato. Cuando lo único que quieres es "un disco físico" o "algo con esta etiqueta", ese paso de emoción sobra y añade fricción.

## What Changes

- Añadir en la pantalla de inicio un acceso de **recomendación rápida** que pregunta lo mínimo: si quieres la recomendación en algún **formato físico** (o cualquiera) y/o de alguna **etiqueta** concreta, y ya.
- Al confirmar, abre la recomendación con esos filtros y sin emoción.

Fuera de alcance: cambiar la recomendación por emoción/actividad existente.

## Capabilities

### New Capabilities

- `quick-recommendation`: acceso desde el inicio que obtiene una recomendación de la colección filtrando solo por formato físico y/o etiqueta, sin elegir emoción.

### Modified Capabilities

- Ninguna.

## Impact

- `src/app/home/pages/StartPage.tsx` (botón y elección mínima).
- `src/locales/es.json`, `src/locales/en.json` (namespace nuevo/`home`).
- Reutiliza la ruta de recomendación existente (`/recommendation`) que ya admite recomendación sin emoción con formato y etiquetas. Sin cambios de API ni dependencias.
