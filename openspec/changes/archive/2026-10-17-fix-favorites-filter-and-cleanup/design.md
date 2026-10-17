# Design

## Context

Ver `proposal.md`. La revisión del código contra las specs base (`openspec/specs/`) reveló defectos concretos. Este documento decide cómo corregirlos.

## Goals / Non-Goals

**Goals**

- Que el filtro por género funcione y nunca lance error.
- Reducir el ruido de mantenimiento eliminando código muerto y roto.

**Non-Goals**

- Cambiar la experiencia de filtrado más allá de hacerla funcionar.
- Unificar los dos sistemas i18n ni añadir UI de cambio de idioma (se abordará con el rediseño).
- Corregir los typos de rutas (`recommendation` vs `recomendationHistory`); es un cambio de rutas observable y merece su propio change.

## Decisions

### 1. Origen de los géneros para el filtrado

El filtro por género tomará los géneros de dos fuentes, en este orden:

1. El campo `genres` del documento del álbum si existe.
2. Las etiquetas del favorito cuya categoría sea "género"/"genre" (normalizada, sin distinguir mayúsculas).

Un álbum sin géneros conocidos no coincide con un filtro de género activo.

**Alternativas consideradas**

- _Consultar géneros de artistas a Spotify_: descartado; implica peticiones adicionales por álbum y mayor latencia para un filtro local.
- _Dejar el filtro desactivado_: descartado; la spec `album-collection` exige que el filtro por género funcione.

### 2. Eliminación de código muerto

Se eliminan los archivos vacíos, el archivo truncado y los componentes nunca importados. Antes de borrar, se confirma por búsqueda que no existan referencias.

## Risks / Trade-offs

- [Borro de un componente que sí se usa] → verificación previa por búsqueda de referencias antes de eliminar.
- [El filtro de género devuelve vacío si no hay metadatos de género] → documentado en la decisión 1; es consistente con "no coincide si no hay género conocido".

## Migration Plan

No requiere migración de datos. Despliegue normal; sin pasos de rollback especiales.
