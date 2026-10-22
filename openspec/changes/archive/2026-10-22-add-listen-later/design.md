# Design

## Context

La colección vive en `users/{uid}/favorites` y referencia el catálogo global `albums`. Las lecturas pasan por `/api/userFavorites`; el guardado por `/api/toggleFavorite`; el detalle y la búsqueda cargan esa misma lista para saber si un álbum está guardado. La biblioteca compartida y el feed de comunidad leen `favorites` y `communityAlbums`, respectivamente. Ver `proposal.md` para la motivación.

Restricciones que condicionan la solución:

- El cliente no accede a Firestore: toda lectura o escritura pasa por rutas API autenticadas con `authenticate()`.
- La colección existente tiene ordenaciones, filtros, etiquetas y una proyección para amistades; no conviene contaminarla con discos que no pertenecen a ella.
- El asistente actual tiene tres pasos y un estado de éxito con deshacer. La elección de destino debe encajar sin romper la edición de un álbum ya guardado.
- La búsqueda y el detalle ya hacen una carga de colección; añadir pendientes no debe multiplicar peticiones por tarjeta.

## Goals / Non-Goals

**Goals:**

- Guardar, listar y quitar pendientes con una identidad propia y sin emociones ni metadatos de colección.
- Mantener la colección, sus filtros, la biblioteca compartida y el feed de comunidad sin cambios de contrato.
- Hacer visible el estado pendiente en búsqueda, detalle y ficha, con una transición explícita a la colección.
- Evitar que un mismo álbum aparezca a la vez como colección y pendiente.

**Non-Goals:**

- Añadir ordenaciones, filtros, etiquetas o notas a la lista de pendientes.
- Compartir pendientes con amistades o publicarlos en comunidad.
- Cambiar el asistente de colección, sus pasos o su validación de formato.
- Crear una entrada nueva en el menú lateral: la sección vive como pestaña de la colección.
- Sincronizar pendientes entre dispositivos por un canal distinto de Firestore.

## Decisions

### 1. Subcolección separada `users/{uid}/listenLater`

Cada pendiente se guarda en `users/{uid}/listenLater/{albumDocId}` con:

- `albumId`: identificador del documento en el catálogo global `albums`.
- `addedAt`: marca de servidor.

El identificador del documento coincide con `albumDocId`, igual que en `favorites`, para que la exclusividad se resuelva con una operación directa. No se guardan emociones, actividades, formato ni etiquetas.

**Por qué:** mantiene las consultas de colección, los filtros, la biblioteca compartida y el feed de comunidad intactos. La alternativa de añadir un campo `status` a `favorites` obligaría a filtrar pendientes en cada lectura y aumentaría el riesgo de que se colaran en la colección o en una sección compartida.

### 2. API dedicada `/api/listenLater`

Una única ruta con tres métodos:

- `GET`: devuelve `{ albums: ListenLaterAlbum[] }`, ordenados por `addedAt` descendente. Cada elemento incluye `id`, `albumId`, `addedAt` y el álbum resuelto desde el catálogo.
- `POST`: recibe `{ album }`. Valida el álbum, reutiliza o crea su entrada en `albums`, comprueba que no esté en `favorites` y escribe el pendiente. Si ya estaba pendiente, responde de forma idempotente.
- `DELETE`: recibe `{ album }`. Si el álbum no está pendiente, responde con `removed: false`; si está, elimina la entrada.

La identidad sale siempre del token. La ruta no publica en `communityAlbums` ni se usa desde `friendLibrary`.

**Por qué:** una ruta pequeña y específica evita mezclar semánticas. `POST` y `DELETE` son idempotentes para que reintentos y dobles pulsaciones no creen duplicados.

### 3. Exclusividad con la colección

- `POST /api/listenLater` rechaza un álbum que ya está en `favorites` con un error de conflicto; la interfaz no llega a ofrecerlo.
- Al guardar en la colección, `toggleFavorite` elimina el documento de `listenLater` en el mismo lote que actualiza el favorito. Así la transición pendiente → colección no deja una entrada huérfana.
- `GET /api/listenLater` excluye de forma defensiva cualquier álbum que también aparezca en `favorites`. Esto cubre datos antiguos o un fallo parcial entre dos escrituras.

**Por qué:** la colección es la fuente de verdad cuando un álbum está en ambas listas. El filtro de lectura evita que una inconsistencia residual se vea en la interfaz.

### 4. Destino como pantalla inicial del guardado

`SaveAlbumModal` gana un modo de entrada:

- **Añadir desde búsqueda o detalle sin estado:** muestra una pantalla de destino con dos acciones: «A la colección» y «Por escuchar». «A la colección» entra en el asistente de tres pasos; «Por escuchar» guarda directamente y pasa al éxito de pendientes.
- **Editar un favorito:** se salta la pantalla de destino y abre el asistente en modo edición, como hoy.
- **Pasar un pendiente a la colección:** se salta la pantalla de destino y abre el asistente en el paso de emociones con destino colección.

La pantalla de destino no forma parte del indicador de tres pasos: es una elección previa, no un cuarto paso de metadatos. El indicador actual se conserva para el camino de colección.

**Por qué:** el usuario ya eligió que la pregunta aparezca al abrir el guardado. Una pantalla inicial evita mezclar la decisión de destino con emociones y formatos, y permite que «Por escuchar» sea una acción única.

### 5. Estados del modal compuestos, no un modal nuevo

`SelectedAlbumModal` amplía su máquina de estados actual con:

- `isPending` y `pendingData` para abrir un paso de álbum pendiente.
- `savedDestination` para que el éxito muestre la confirmación de colección o de pendientes.
- `forceCollection` para el salto pendiente → asistente de colección.

El paso de pendiente reutiliza el shell y la cabecera del álbum, y ofrece «Pasar a la colección» y «Quitar de pendientes». El éxito de pendientes reutiliza el shell actual, con copy propio y acciones «Ver pendientes» y «Deshacer»; no se duplica el modal completo.

**Por qué:** el shell, la portada, el cierre y la ergonomía móvil ya están resueltos. Añadir un modal paralelo multiplicaría estilos y comportamientos de teclado.

### 6. Carga de ambos estados en las pantallas que ya cargan colección

- `favorites/page.tsx` carga colección y pendientes en paralelo y mantiene dos pestañas. La pestaña de colección conserva ordenación y filtros; la de pendientes es una lista simple por fecha.
- `search/page.tsx` carga ambas listas en paralelo y construye dos mapas por `album.id`.
- `albums/[albumId]/page.tsx` hace lo mismo para decidir entre estado colección, pendiente o no guardado.

`AlbumCard` recibe un indicador de pendiente además de `isFavorite`. La precedencia visual es colección > pendientes > no guardado. La pestaña activa se inicializa desde `?tab=listen-later` para que «Ver pendientes» pueda enlazar directamente; si la lectura de ese parámetro no es viable sin Suspense, se usa el mismo valor con `window.location.search` en un efecto de montaje.

**Por qué:** dos peticiones en paralelo son preferibles a una petición por tarjeta. Mantener mapas por álbum conserva el patrón actual de la búsqueda.

### 7. Privacidad por construcción

`listenLater` no se lee desde `loadSharedCollection` ni se escribe desde `communityAlbums`. La privacidad no depende de un filtro en la interfaz: la nueva ruta solo devuelve datos del `uid` autenticado.

## Risks / Trade-offs

- **Pendiente huérfano tras guardar en colección** → el guardado usa un lote que actualiza el favorito y elimina el pendiente; además, `GET /api/listenLater` filtra álbumes que ya están en `favorites`.
- **Dos peticiones adicionales en búsqueda y detalle** → se hacen en paralelo con las que ya existen y se reutilizan mapas; no se consulta por tarjeta.
- **Pestaña de pendientes sin ordenación ni filtros** → es una decisión de alcance: la lista es corta y se ordena por fecha. Se puede ampliar después sin cambiar el modelo.
- **Doble estado por una carrera entre guardar en pendientes y guardar en colección** → `POST /api/listenLater` comprueba `favorites` y la lectura de pendientes filtra favoritos; la colección gana siempre.
- **El parámetro de pestaña puede requerir Suspense en Next.js** → se encapsula la lectura o se usa `window.location.search` al montar, sin afectar al render inicial de la colección.

## Migration Plan

- No hay migración de datos: `users/{uid}/listenLater` empieza vacía y `favorites` no se modifica.
- Desplegar primero la API y después la interfaz; la ruta nueva es aditiva.
- Rollback: retirar la pestaña y las acciones de pendientes. Los documentos de `listenLater` quedan inertes y no afectan a la colección, la biblioteca compartida ni el feed de comunidad.
- No se requieren índices compuestos ni cambios en las reglas de Firestore; el acceso sigue siendo solo mediante la API con privilegios.
