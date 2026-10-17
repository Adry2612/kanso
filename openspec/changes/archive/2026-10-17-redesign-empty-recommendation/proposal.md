# Proposal

## Why

Cuando ninguna entrada de la colección coincide con la emoción elegida, la pantalla de resultado muestra un callejón sin salida: *"No hemos encontrado un álbum"* y un botón "Volver a elegir". No explica que no hay álbumes para esa emoción ni ofrece la salida natural, que es añadir a la colección un álbum que te haga sentir así. El flujo termina en frustración justo cuando el usuario tiene una intención clara.

## What Changes

- Rediseñar el estado sin coincidencias de la recomendación por emoción como un estado vacío cuidado que:
  - explica que no hay álbumes en la colección que encajen con la emoción seleccionada;
  - muestra las emociones elegidas para dar contexto;
  - ofrece una llamada a la acción principal que lleva a la búsqueda para añadir un álbum que te haga sentir así;
  - mantiene una salida secundaria para volver a elegir.
- Mantener el comportamiento para errores técnicos (fallo de red) diferenciado del estado "sin coincidencias".

Fuera de alcance: el flujo por actividad y la lógica de selección (no cambian).

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `recommendations`: el estado sin coincidencias de la recomendación por emoción deja de ser un mensaje de error y pasa a ser un estado vacío con invitación a añadir un álbum desde la búsqueda.

## Impact

- `src/app/home/pages/RecomendationPage.tsx` (bloque de estado vacío y distinción entre "sin coincidencias" y error técnico)
- `src/locales/es.json`, `src/locales/en.json` (textos del estado)
- Reutiliza `Reveal`/`motion` de `src/components/motion`. Sin nuevas dependencias.
