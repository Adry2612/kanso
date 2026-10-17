# Design

## Context

Ver `proposal.md` — Why. Hoy `src/app/search/page.tsx` distingue tres estados cuando hay una búsqueda activa (`result`): resultados (`result.albums.items.length > 0`), sin resultados (un `<p>` con `t("noAlbumsFound")`) y error (`error`). El estado sin resultados no reutiliza las sugerencias de colección (`collectionMoods`, `collectionTags`) que sí se calculan para el estado inicial.

## Goals / Non-Goals

**Goals:**

- Convertir "sin resultados" en un estado vacío que explique y ofrezca salidas.
- Reutilizar las sugerencias de la colección ya calculadas.

**Non-Goals:**

- Cambiar la búsqueda, el debounce o el estado inicial.
- Añadir búsqueda por artista (va en `artist-discovery`).

## Decisions

### 1. Un bloque de estado vacío, no un párrafo

Se renderiza un bloque coherente con el resto de estados vacíos (título, texto, acciones) mostrando:
- el término buscado,
- una acción "Limpiar búsqueda" que vacía la consulta,
- chips de las emociones y etiquetas de la colección (cuando existan) que reestablecen la consulta.

**Alternativas consideradas**

- _Mantener el párrafo y añadir un botón_: sigue sin dar contexto ni sugerencias. Descartada.

### 2. Reutilizar `collectionMoods` y `collectionTags`

Ya se calculan en la página para el estado inicial; el estado sin resultados los reutiliza sin lógica nueva.

### 3. Textos en i18n

Textos nuevos bajo el namespace `search` en `src/locales/{es,en}.json`.

## Risks / Trade-offs

- [Confusión entre "sin resultados" y error] → el error se mantiene arriba y con tratamiento propio; el estado sin resultados solo aparece cuando no hay error.
- [Sugerencias repetidas entre estado inicial y sin resultados] → es intencional: cubren "vacío" y "búsqueda fallida" respectivamente.

## Migration Plan

No requiere migración. Despliegue normal.
