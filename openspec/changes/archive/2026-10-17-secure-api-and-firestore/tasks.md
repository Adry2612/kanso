# Tasks

## 0. Prerrequisitos

- [x] 0.1 Crear una **service account** del proyecto `collectify-2d503` y añadirla a `.env` (`FIREBASE_SERVICE_ACCOUNT_PATH`)
- [x] 0.2 Desplegar las reglas (sin CLI: vía la API REST de Firebase Rules con la service account)
- [x] 0.3 Activar **Anónimo** en Authentication (modo invitado), vía la API admin de Identity Toolkit

## 1. Base del servidor

- [x] 1.1 Añadir `firebase-admin` a `package.json`
- [x] 1.2 Crear la inicialización del Admin SDK leyendo la service account de `.env` (`src/lib/firebaseAdmin.ts`)
- [x] 1.3 Crear `authenticate(request)`: verifica el ID token y devuelve el uid, o 401 (`src/lib/apiAuth.ts`)

## 2. Migrar las rutas

- [x] 2.1 Rutas de datos de usuario (`userFavorites`, `userArtists`, `getRecomendationHistory`, `saveRecomendationHistory`, `toggleFavorite`, `removeFavorite`, `toggleArtistFavorite`, `artistReleases`, `getAlbumsByMood`) derivan el uid del token
- [x] 2.2 Rutas públicas sin datos de usuario (`communityAlbums`, `communitySearches`, `getAlbumTracklist`) pasan al Admin SDK (las reglas ya deniegan el SDK web)
- [x] 2.3 Mover a la API la lectura de `getRecommendedAlbumByActivity` (`/api/getRecommendedAlbumByActivity` + módulo de recomendaciones puro)

## 3. Cliente

- [x] 3.1 Helper de fetch autenticado que adjunta `Authorization: Bearer <idToken>` (`src/lib/api/authFetch.ts`)
- [x] 3.2 Usarlo en las llamadas a la API (colección, artistas, historial, novedades, recomendación y las páginas que leían `/api/userFavorites`)

## 4. Reglas y configuración

- [x] 4.1 Escribir `firestore.rules` (denegar acceso directo), `firebase.json` y `.firebaserc`
- [x] 4.2 Documentar las variables del Admin SDK en `.env.example` y proteger `serviceAccount*.json` en `.gitignore`
- [x] 4.3 Desplegar las reglas (release `cloud.firestore`)

## 5. Verificación

- [x] 5.1 Sin token → 401 en todas las rutas protegidas (comprobado por HTTP: 9 rutas)
- [x] 5.2 Con token de A y `userId` de B → opera sobre A (mismos datos; el `userId` se ignora)
- [x] 5.3 Lectura directa a Firestore desde el cliente → `403 PERMISSION_DENIED`
- [x] 5.4 API funcionando con token (17/17 comprobaciones) y modo invitado operativo
- [x] 5.5 `tsc`, lint y build sin errores (build 31/31)

## Fuera de alcance

- App Check (change posterior).
