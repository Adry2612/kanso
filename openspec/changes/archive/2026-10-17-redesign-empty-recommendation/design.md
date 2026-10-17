# Design

## Context

Ver `proposal.md` — Why. Hoy `RecomendationPage` deriva todo de dos fuentes: `useFetch(getRecomendation)` (línea de estado de error para el flujo por emoción) y `activityError` (flujo por actividad). `getRecomendation` lanza cuando la respuesta no es `ok`, y el backend devuelve `404` con `"No se encontraron álbumes"` cuando no hay coincidencias (`getAlbumsByMood/route.ts`). Es decir, "sin coincidencias" y "error técnico" se representan igual: como error.

## Goals / Non-Goals

**Goals:**

- Separar "sin coincidencias" (estado vacío accionable) de "error técnico" (mensaje de error).
- Que el estado vacío muestre las emociones elegidas y lleve a la búsqueda.

**Non-Goals:**

- Cambiar el flujo por actividad.
- Cambiar la selección de álbum o el contrato del backend.

## Decisions

### 1. El cliente de recomendación distingue "sin coincidencias" de error

`getRecomendation` devolverá `null` cuando el backend responda `404` (sin coincidencias) y seguirá lanzando ante cualquier otro fallo. Así `RecomendationPage` puede renderizar el estado vacío cuando el resultado es `null` y el error técnico cuando hay excepción.

**Alternativas consideradas**

- _Inspeccionar el texto del error en el componente_: frágil (depende del idioma del mensaje y de strings). Descartada.
- _Añadir un flag `empty` en la respuesta 404_: mantiene el `throw` en el cliente y obliga a leer el body; devolver `null` es más simple. Descartada.

### 2. El estado vacío es un bloque de contenido, no un error

Se renderiza con la tipografía y materiales del resto (`Reveal`, superficie elevada), mostrando:
- un titular claro de "no hay álbumes para esa emoción",
- las emociones elegidas como chips (reutilizando el mapeo `moods` + `getMood`/`tMoods`),
- una CTA primaria "Añadir un álbum que me haga sentir así" → `/search`,
- una acción secundaria "Volver a elegir" → `history.back()`.

El error técnico mantiene un bloque de error con `role="alert"`.

**Alternativas consideradas**

- _Reusar el bloque de error actual con otro texto_: no da cabida a las emociones ni a la CTA. Descartada.

### 3. Textos en i18n

Los textos nuevos van a `src/locales/{es,en}.json` bajo el namespace `recommendation` (ya existe), evitando más hardcodeo.

## Risks / Trade-offs

- [Cambia la semántica de retorno de `getRecomendation` (`null` en 404)] → su único consumidor es `RecomendationPage`; se actualiza en el mismo change.
- [El backend podría devolver 404 por "álbum no encontrado" tras filtrar, no solo por sin coincidencias] → en ese caso el estado vacío sigue siendo la salida correcta (invitar a añadir álbumes).

## Migration Plan

No requiere migración. Despliegue normal.
