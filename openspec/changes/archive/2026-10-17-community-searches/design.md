# Design

## Context

Ver `proposal.md` — Why. `src/app/search/page.tsx` hace la petición con debounce a `/api/search` y muestra el estado inicial cuando `!result && !loading && !error`. Los datos de Firestore se leen hoy desde rutas API con el Web SDK en el servidor (`src/app/api/userFavorites/route.ts`), patrón que el change `secure-api-and-firestore` endurecerá. Este change sigue ese patrón para no mezclar ámbitos.

## Goals / Non-Goals

**Goals:**

- Registrar términos de búsqueda de forma anónima y agregada.
- Mostrarlos en el estado inicial y permitir reutilizarlos como consulta.

**Non-Goals:**

- Guardar quién busca qué (privacidad).
- Moderación avanzada de contenido.
- Reglas de seguridad y Admin SDK (change aparte).

## Decisions

### 1. Un documento agregado por término normalizado

Colección `communitySearches`, id de documento = término normalizado (trim + minúsculas). Campos: `term` (texto original), `count` (entero), `lastAt` (timestamp). El registro usa incremento atómico y `merge`, de modo que no hay condición de carrera.

**Alternativas consideradas**

- _Un documento por búsqueda_: crece sin límite y facilita el spam/duplicados; agrupar por término es más barato de leer. Descartada.
- _Guardar el userId_: rompe la promesa de anonimato. Descartada.

### 2. Endpoints `GET`/`POST`

- `POST /api/communitySearches` con `{ term }`: valida no vacío y limita la longitud (p. ej. 60 caracteres), normaliza y hace `setDoc(..., { merge: true })` con `count: increment(1)`, `lastAt: serverTimestamp()`.
- `GET /api/communitySearches`: devuelve las últimas N (`orderBy("lastAt", "desc").limit(8)`).

### 3. Presentación y degradación

La sección "Búsquedas de la comunidad" se muestra en el estado inicial; si la carga falla o está vacía, no se muestra (sin error invasivo). El registro se dispara al ejecutar una búsqueda con resultados de la consulta (no en cada tecla).

**Alternativas consideradas**

- _Registrar en cada pulsación_: ensuciaría el agregado con prefijos parciales. Descartada; se registra la consulta ya "debounced".

### 4. Privacidad

Solo se almacena el término, sin identidad. Se limita longitud y se normaliza. La UI no muestra autores.

## Risks / Trade-offs

- [Contenido inapropiado en los términos] → riesgo aceptado por ahora; se documenta moderación como fuera de alcance.
- [Spam de términos] → mitigable con reglas y rate limiting en el change de seguridad.
- [El `POST` es público con el Web SDK en servidor] → se endurece en `secure-api-and-firestore`.

## Migration Plan

No requiere migración. La colección se crea al primer registro. Despliegue normal.
