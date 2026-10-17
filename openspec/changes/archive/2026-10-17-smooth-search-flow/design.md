# Design

## Context

Ver `proposal.md` — Why. El inicio de `/search` ya registra el término con un `useEffect` sobre `debouncedQuery` (500 ms) y muestra la sección de la comunidad con `GET /api/communitySearches`. Los resultados se piden a `/api/search` desde otro efecto sobre `debouncedQuery`.

## Goals / Non-Goals

**Goals:**

- Que el feed de la comunidad contenga búsquedas reales y consistentes.
- Que escribir rápido nunca muestre resultados obsoletos.

**Non-Goals:**

- Moderación del feed.
- Cambiar el retardo de los resultados (se mantiene en 500 ms).

## Decisions

### 1. Registro con asentamiento propio

El registro deja de compartir el retardo con los resultados: un efecto sobre `query` espera 1.5 s de inactividad, ignora términos de menos de 3 caracteres y se salta el término si coincide con el último registrado en la sesión. Así `extre` (pausa corta a media palabra) no llega a registrarse.

**Alternativas consideradas**

- _Registrar solo al pulsar un resultado_: cambia el comportamiento y pierde búsquedas exploratorias. Descartada.
- _Mantener el mismo debounce de 500 ms_: es el origen del problema. Descartada.

### 2. Coalescer prefijos parciales

Si el término nuevo extiende al último registrado en la misma sesión (`extre` → `extremoduro`), el cliente envía `previousTerm` y el servidor elimina el documento del parcial tras registrar el término definitivo. Coste: si otra persona hubiera registrado ese mismo parcial, también se elimina; se acepta por el bajo impacto.

### 3. Normalización

`normalizeTerm` pasa a minúsculas además de recortar y colapsar espacios. Se aplica al guardar (`POST`) y al leer (`GET`), de modo que los documentos antiguos con mayúsculas (`NACH`) se muestran ya normalizados sin migración.

### 4. Cancelar la petición anterior

La búsqueda de resultados usa `AbortController`: al cambiar la consulta se aborta la petición en curso y se ignoran los `AbortError`, evitando que una respuesta antigua sobrescriba a la nueva. La consulta se recorta (`trim`) antes de decidir si hay búsqueda.

## Risks / Trade-offs

- [Eliminar un parcial compartido] → impacto mínimo y acotado a la sesión de escritura.
- [1.5 s de espera para registrar] → el registro es best-effort y no altera los resultados.
