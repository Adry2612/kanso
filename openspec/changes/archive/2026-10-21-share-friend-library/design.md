# Design

## Context

Ver `proposal.md` para la motivación. La rama ya tiene `add-friends` implementado: perfil perezoso en `users/{uid}`, códigos en `friendCodes/{code}`, amistad bidireccional en `users/{uid}/friends/{friendUid}` y bloqueo de invitados con `requireRegistered()`. La vista pública `/f/[code]` solo devuelve nombre, avatar y relación; no existe ninguna ruta que lea la colección de otra persona.

Los datos que se quieren compartir ya existen en subcolecciones privadas:

- `users/{uid}/recomendationHistory`: `albumId`, `moods`, `providedAt`.
- `users/{uid}/favorites`: `albumId`, `labeledFeelings`, `activities`, `tags`, `format`, `addedAt`.
- `users/{uid}/artists`: `artistId`, `name`, `images`, `genres`, `followers`, `addedAt`.

La API deriva siempre la identidad del token (`authenticate`) y nunca confía en un identificador de usuario enviado por el cliente. Las rutas de amigos ya devuelven `Cache-Control: no-store`.

## Goals / Non-Goals

**Goals:**

- Definir un contrato de compartición granular y privado por defecto.
- Permitir que una amistad mutua consulte solo las secciones activadas, mediante una ruta autenticada.
- Dar una entrada clara desde `/friends` y una página de perfil privado de solo lectura.
- No cambiar el comportamiento ni el contrato de la vista pública del QR.

**Non-Goals:**

- No se añade paginación, búsqueda ni filtros a la biblioteca compartida; se puede valorar después.
- No se comparten etiquetas personales, notas, correo, UID ni código de invitación.
- No se añade tiempo real: los cambios se ven en la siguiente carga.
- No se modifica el modelo de datos de favoritos, recomendaciones o artistas.
- No se añaden notificaciones ni un feed de actividad.

## Decisions

### 1. La compartición vive en `users/{uid}.sharing`

Se añade un mapa con tres booleanos independientes:

```ts
type FriendSharingSettings = {
  recommendations: boolean;
  collection: boolean;
  artists: boolean;
};
```

Todo ausente se normaliza a `false`. `ensureUserProfile()` lee y normaliza el mapa, y persiste los valores normalizados al crear o refrescar el perfil. `getUserSummary()` sigue devolviendo solo nombre y avatar, de modo que la vista pública no cambia.

**Por qué:** el perfil ya existe y se lee en el flujo de amigos; no hace falta otra colección ni una lectura adicional para la configuración. El valor por defecto se aplica de forma perezosa, sin migración.

**Alternativas descartadas:** un documento `users/{uid}/settings/privacy` (más lecturas y más código para el mismo dato); un único interruptor global (no cumple el control por sección); un array de secciones activas (menos explícito y más propenso a valores inválidos).

### 2. Autorización: identidad del token, recurso en la ruta

`GET /api/friends/[uid]/library` recibe el UID objetivo en la ruta, pero la identidad de quien consulta sale exclusivamente del token. Antes de leer nada se comprueba:

1. Token válido y cuenta registrada (`authenticate` + `requireRegistered`).
2. UID objetivo con el mismo patrón que usa el resto de amigos (`isValidUid`).
3. Existencia de **ambos** documentos de amistad: `users/{requester}/friends/{target}` y `users/{target}/friends/{requester}`.
4. Perfil objetivo existente.

Si falta cualquiera de las comprobaciones, la respuesta es `404` con un mensaje genérico (`Perfil no disponible.`), también cuando el UID no existe. Así no se puede enumerar cuentas ni distinguir «no existe» de «no es tu amigo». Un invitado recibe el `403` de `requireRegistered`; una petición sin token recibe el `401` de `authenticate`.

**Por qué:** evita un IDOR y mantiene el principio de `api-security`: el UID de la ruta selecciona un recurso, no autentica a nadie. Comprobar las dos direcciones protege ante una amistad parcialmente borrada.

**Alternativas descartadas:** confiar en el UID de la ruta (inseguro); comprobar solo un lado de la amistad (tolera amistades inconsistentes); permitir el acceso por código público (rompe la privacidad del QR).

### 3. Superficie de API separada para configuración y lectura

- `GET /api/friends` añade `sharing` al `profile` propio.
- `PATCH /api/friends/sharing` acepta un cuerpo parcial con cualquiera de las tres claves booleanas, valida tipos, hace `merge` en `users/{uid}` y devuelve `{ sharing }`. Rechaza cuerpos vacíos o valores no booleanos con `400`.
- `GET /api/friends/[uid]/library` devuelve:

```ts
type FriendLibraryResponse = {
  profile: { displayName: string; photoURL: string | null };
  sharing: FriendSharingSettings;
  recommendations?: SharedRecommendation[];
  collection?: SharedCollectionAlbum[];
  artists?: SharedArtist[];
};
```

Solo se incluyen las claves de las secciones activadas. Si una sección está activa pero vacía, se incluye como array vacío para que la UI muestre su estado vacío; si está desactivada, se omite.

**Por qué:** la configuración tiene una ruta de escritura pequeña y la lectura de la biblioteca tiene otra, con permisos distintos. El perfil de la respuesta no incluye `uid`, correo, código ni etiquetas.

**Alternativas descartadas:** devolver la biblioteca dentro de `GET /api/friends` (payload grande y datos de todos los amigos en una sola llamada); una ruta por sección (tres peticiones y tres comprobaciones de autorización); reutilizar `/api/userFavorites` con un UID ajeno (rompe el contrato de identidad y expone datos privados).

### 4. Proyección mínima de los datos

La biblioteca compartida no reutiliza los documentos completos de Spotify. Se proyectan solo los campos que la UI necesita:

```ts
type SharedAlbumSummary = {
  id: string;
  name: string;
  images: { url: string }[];
  artists: { name: string }[];
  releaseDate: string | null;
  spotifyUrl: string | null;
};

type SharedRecommendation = {
  id: string;
  providedAt: string | null;
  moods: string[];
  album: SharedAlbumSummary | null;
};

type SharedCollectionAlbum = {
  id: string;
  addedAt: string | null;
  labeledFeelings: string[];
  activities: string[];
  format: FavoriteFormat[];
  album: SharedAlbumSummary | null;
};

type SharedArtist = {
  id: string;
  name: string;
  images: { url: string }[];
  genres: string[];
  addedAt: string | null;
};
```

`collection` **no incluye `tags`**. Tampoco se devuelven `available_markets`, `tracks`, `href`, `uri` ni otros campos internos del álbum.

**Por qué:** minimiza la superficie de datos y hace explícito qué se comparte. Las etiquetas son una clasificación personal que no forma parte del contenido que el usuario espera enseñar al activar «Álbumes».

**Alternativas descartadas:** devolver el documento completo de `albums/{albumId}` (más datos de los necesarios y más fácil que se filtren campos); compartir también las etiquetas (mayor exposición sin una decisión de producto explícita).

### 5. Carga de datos en el servidor

Se crea `src/lib/friendLibrary.ts` con:

- `normalizeSharing(value)`.
- `toSharedAlbum(data)`, `toSharedRecommendation(...)`, etc.
- `loadSharedRecommendations(uid)`, `loadSharedCollection(uid)`, `loadSharedArtists(uid)`.

La ruta hace primero las lecturas de autorización en paralelo (perfil objetivo y las dos amistades). Después, solo si la sección está activa, lanza las consultas de datos en paralelo. Para los álbumes se recogen las referencias y se resuelven con `db.getAll(...)` en lugar de una lectura por elemento. Los resultados se ordenan por fecha descendente.

La normalización de formatos de favoritos se extrae a un helper compartido y se usa tanto en `userFavorites` como en la biblioteca de amigos, para que un favorito antiguo con `format` string y `ownership` se vea igual en ambas rutas.

**Por qué:** mantener la lógica de lectura en servidor evita que el cliente toque Firestore, y `getAll` reduce el número de lecturas. Extraer la normalización evita dos contratos distintos para el mismo dato.

**Alternativas descartadas:** llamar por HTTP a las rutas existentes desde la nueva ruta (doble autenticación, más latencia y riesgo de recursión); leer los documentos completos en el cliente (las reglas de Firestore lo impiden).

### 6. UI: configuración en `/friends`, perfil de solo lectura en `/friends/[uid]`

En `/friends`:

- Se añade un panel «Qué compartes» con tres interruptores accesibles (`role="switch"`, `aria-checked`, foco visible). Cada cambio se guarda con `PATCH /api/friends/sharing`; la UI actualiza de forma optimista y revierte si falla, mostrando un mensaje de error. No hay botón de guardar separado.
- Cada fila de amistad añade un enlace «Ver perfil» a `/friends/[uid]`. En esta versión no se muestra un indicador de cuántas secciones comparte cada amistad: el perfil es la fuente de verdad y evita lecturas extra en la lista.
- El texto de la cabecera y del modal de compartir se ajusta: el QR público sigue sin mostrar la colección; los amigos solo ven lo que se active.

En `/friends/[uid]`:

- Página cliente con `useParams`, `useAuth` e i18n. Estados: carga, sin sesión, invitado, error con reintento, perfil no disponible y contenido.
- Sin sesión o invitado: CTA a login/registro con `next=/friends/[uid]`; no se llama a la API.
- Cabecera con enlace de vuelta a `/friends`, avatar, nombre y una nota de que es un perfil compartido.
- Secciones apiladas, solo las activas: recomendaciones, álbumes y artistas. Cada una tiene su estado vacío.
- Recomendaciones: filas agrupadas por fecha con portada, álbum, artistas, emociones y enlace a Spotify. Se reutilizan `groupByDate` y `formatTime`.
- Álbumes: tarjeta de solo lectura con portada, título, artistas, emociones, actividades, formato y enlace a Spotify; sin etiquetas, sin botón de añadir y sin eliminar.
- Artistas: se reutiliza `ArtistCard` sin `onToggleFavorite` (nombre, imagen y géneros; sin acción de favorito).
- Si no hay ninguna sección activa, un estado vacío único con enlace de vuelta.
- `404`/`403` de la API se traducen a un mensaje genérico «Perfil no disponible»; no se distingue entre no existente y no amigo.

**Por qué:** el perfil privado es el lugar natural para consultar; la lista de amigos no se sobrecarga con tres peticiones por persona. Las tarjetas de solo lectura evitan acciones que modificarían datos ajenos.

**Alternativas descartadas:** un modal/drawer en `/friends` (peor enlace compartible y peor navegación móvil); un feed global (más complejo y no pedido); reutilizar `AlbumCard` con su botón de añadir (confunde la colección ajena con la propia).

### 7. La vista pública no cambia

`/f/[code]` y `/api/publicProfile` mantienen su contrato. El perfil privado no es accesible desde el código público; para llegar a `/friends/[uid]` hay que ser amistad y estar registrado. El botón «Ir a Amigos» que ya aparece cuando la relación es `friend` sigue siendo el puente.

**Por qué:** el QR es una capacidad que se puede reenviar; no debe convertirse en una llave para la colección.

### 8. Navegación e i18n

No se añade una entrada nueva al sidebar: `/friends/[uid]` cuelga de Amigos. El cálculo de sección activa del `Header` ya usa `pathname.startsWith(`${item.href}/`)`, así que «Amigos» queda activo sin cambios.

Se añaden claves en `friends.privacy`, `friends.profile` y textos de estado en `es.json` y `en.json`. Se actualizan `friends.subtitle` y `friends.share.description` para que la promesa de privacidad siga siendo exacta.

## Risks / Trade-offs

- **Fricción del opt-in** → perfiles vacíos hasta que la persona configure algo. Mitigación: panel visible en `/friends`, textos claros y estado vacío que explica que no comparte nada, sin culpar a nadie.
- **Datos obsoletos tras desactivar** → la siguiente carga puede mostrar una copia en caché del navegador. Mitigación: `Cache-Control: no-store`, recarga al entrar y no prometer tiempo real.
- **Bibliotecas grandes** → devolver todo puede generar respuestas pesadas. Mitigación: `getAll` para álbumes y orden descendente; paginación y límites quedan como seguimiento si aparece el problema.
- **Amistad eliminada durante la consulta** → una petición en vuelo podría terminar después de eliminar la amistad. Mitigación: comprobar ambas amistades antes de leer y no cachear; la siguiente petición se deniega.
- **Confusión entre «no comparte» y «no tiene datos»** → Mitigación: la API envía `sharing`; la UI distingue sección desactivada (no se muestra) de sección activa vacía (estado vacío).
- **Regresión de privacidad** → Mitigación: proyección mínima, sin etiquetas ni UID, `404` genérico, pruebas manuales con dos cuentas y revisión de que `/f` y `/api/publicProfile` no cambian.
- **Textos que prometen de más** → el mensaje actual «Solo verás su nombre y su avatar» deja de ser cierto. Mitigación: actualizar `friends.subtitle` y el modal de compartir en ambos idiomas.

## Migration Plan

1. Desplegar primero la API y la normalización de `sharing`; las cuentas existentes se leen como privadas.
2. Desplegar la UI de configuración y el perfil privado.
3. No hay backfill: los documentos sin `sharing` se normalizan a `false` en cada lectura y `ensureUserProfile` persiste los valores al refrescar el perfil.
4. Rollback: ocultar los enlaces de la UI y revertir las rutas nuevas. Como el valor por defecto es privado, no queda contenido expuesto ni hace falta limpiar datos. Los mapas `sharing` añadidos son inocuos.
5. `add-friends` ya está implementado en la rama; la nueva capacidad se puede archivar de forma independiente, pero conviene archivar `add-friends` antes para que la especificación principal de amigos esté consolidada.
