# Kanso API · colección Bruno

Colección de peticiones para probar la API de Kanso desde [Bruno](https://www.usebruno.com/).

## Puesta en marcha

1. Genera el entorno local desde el `.env` del proyecto:

   ```bash
   npm run bruno:env
   ```

   Esto crea `bruno/kanso-api/environments/Local.bru` con `baseUrl` y
   `firebaseApiKey`. El archivo está ignorado por Git.

2. Abre Bruno e importa la carpeta `bruno/kanso-api`.
3. Selecciona el entorno **Local**.
4. Ejecuta primero `00 · Auth / Anonymous sign in`. La petición guarda
   automáticamente `idToken` y `uid` en el entorno `Local` y las persiste en
   disco, así que no tienes que copiar el token a mano.
5. A partir de ahí, todas las peticiones autenticadas leen el token con
   `Authorization: Bearer {{idToken}}` sin que tengas que volver a iniciar
   sesión. `00 · Auth / Clear session vars` limpia ambos valores.

La colección además tiene un script de colección que:

- Si no hay `idToken`, inicia sesión automáticamente.
- Si el token ha caducado, lo renueva antes de la petición.
- Si una petición devuelve `401`, limpia el token para que la siguiente vuelva
  a autenticarse.
- Añade `Authorization: Bearer {{idToken}}` a cada petición.

`npm run bruno:env` conserva el token y las credenciales que ya tengas guardadas
en `Local.bru`; solo actualiza `baseUrl` y `firebaseApiKey`.

## Cuentas registradas

`/api/profile`, `/api/friends/*` y las rutas que usan `requireRegistered`
rechazan sesiones anónimas con un `403`:

```json
{ "error": "Necesitas una cuenta para usar Amigos." }
```

Para probarlas:

1. Rellena `testEmail` y `testPassword` en el entorno `Local`.
2. Ejecuta cualquier petición. La colección intenta crear la cuenta de prueba si
   no existe y, si ya existe, inicia sesión con ella.
3. Si usas Bruno CLI, las variables marcadas como secretas no se leen del
   archivo de entorno. Pásalas explícitamente:

   ```bash
   bru run 01-profile/01-get-profile.bru --env Local \
     --env-var "testEmail=tu-cuenta@ejemplo.com" \
     --env-var "testPassword=tu-contraseña"
   ```

## Si sigue apareciendo “Falta el token de autenticación”

1. Comprueba que el entorno **Local** está seleccionado en Bruno.
2. Cierra y vuelve a abrir la colección: Bruno no siempre recarga los scripts de
   colección modificados en disco.
3. Ejecuta cualquier petición. El script de colección debería rellenar
   `idToken` automáticamente.
4. Revisa la pestaña de variables del entorno: `idToken` debe tener valor.
5. Si el token está vacío, ejecuta `00 · Auth / Anonymous sign in` una vez y
   revisa que la respuesta sea `200`.

Un `401` significa que no llegó ningún token. Un `403` significa que el token
llegó, pero la cuenta es anónima y esa ruta exige una cuenta registrada.

## Variables importantes

| Variable             | Uso                                                                              |
| -------------------- | -------------------------------------------------------------------------------- |
| `baseUrl`            | URL del servidor. Por defecto `http://localhost:3000`.                           |
| `firebaseApiKey`     | `NEXT_PUBLIC_FIREBASE_API_KEY` del `.env`.                                       |
| `idToken` / `uid`    | Se rellenan solos al iniciar sesión. No los commitees.                           |
| `albumId`            | ID de Spotify del álbum de prueba.                                               |
| `albumDocId`         | ID del documento de Firestore en `albums/{id}`. Se usa en tracklist e historial. |
| `artistId`           | ID de Spotify del artista de prueba.                                             |
| `friendUid`          | UID de otra cuenta para probar amistades.                                        |
| `friendCode`         | Código público de amistad de esa cuenta.                                         |
| `friendRequestId`    | ID de una solicitud de amistad existente.                                        |
| `collectionMood`     | Emoción de prueba para guardar en colección.                                     |
| `collectionFormat`   | Formato de prueba (`digital`, `cd`, `cassette`, `vinyl`).                        |
| `collectionActivity` | Actividad de prueba.                                                             |
| `communityTerm`      | Término para el buscador comunitario.                                            |
| `activity`           | Actividad para la recomendación por actividad.                                   |

`albumDocId` no es el ID de Spotify: es el `id` del documento de Firestore que
devuelve, por ejemplo, `GET /api/userFavorites` dentro de cada favorito.

## Orden recomendado

1. `00 · Auth`
2. `02 · Collection` o `03 · Listen later`
3. `04 · Search`
4. `05 · Community`
5. `06 · Recommendations`
6. `07 · Artists`
7. `08 · Friends` (requiere cuenta registrada y otra cuenta de prueba)

Las peticiones de escritura modifican datos reales del proyecto configurado en
`.env`. Usa un proyecto de desarrollo.
