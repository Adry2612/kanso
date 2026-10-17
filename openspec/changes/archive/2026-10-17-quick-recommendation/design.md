# Design

## Context

Ver `proposal.md` — Why. `StartPage` ya tiene un flujo de recomendación por emoción/actividad en dos pasos (sensación → fuente con formato y etiquetas) que termina en `router.push('/recommendation?...')`. El endpoint `POST /api/getAlbumsByMood` ya soporta **moods vacío** (devuelve la colección filtrada por formato y etiquetas) y `RecomendationPage` ya muestra el estado sin coincidencias cuando no hay resultados.

## Goals / Non-Goals

**Goals:**

- Un acceso de un solo paso que no pregunte la emoción.
- Reutilizar la ruta y el endpoint existentes.

**Non-Goals:**

- Sustituir el flujo por emoción/actividad.
- Añadir filtros nuevos más allá de formato y etiqueta.

## Decisions

### 1. Reutilizar `/recommendation` con emoción vacía

La recomendación rápida navega a `/recommendation?format=<all|vinyl|cd|cassette>[&tag=categoria:valor]&type=mood` sin `moods`. El backend ya devuelve la colección filtrada y la pantalla ya gestiona "sin coincidencias".

**Alternativas consideradas**

- _Endpoint nuevo para recomendación rápida_: duplicaría lógica que ya existe. Descartada.

### 2. Elección mínima en la home

Un botón "Recomendación rápida" abre un bloque compacto (o modal) con:
- formatos: "Cualquiera", "Vinilos", "CDs", "Cassettes";
- etiquetas de la colección (si existen), reutilizando `collectionTags` que `StartPage` ya calcula;
- un botón "Recomendar".

Sin selección de emoción.

**Alternativas consideradas**

- _Ir directo sin preguntar nada_: pierde la intención de formato/etiqueta que pide la persona. Descartada.

### 3. i18n

Textos bajo un namespace dedicado (`quickRecommendation`) o dentro de `home`, en `src/locales/{es,en}.json`.

## Risks / Trade-offs

- [Confusión con el flujo por emoción] → el acceso se presenta como una acción aparte y explícita ("Recomendación rápida").
- [Etiquetas en formato "categoria:valor"] → se reutiliza el contrato ya existente del flujo por emoción.

## Migration Plan

No requiere migración. Despliegue normal.
