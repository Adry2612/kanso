# Design

## Contexto

`signInWithGoogle` hacía dos cosas: abrir el popup de Firebase y escribir el documento `users/{uid}`. La segunda es incompatible con el modelo de seguridad vigente:

```js
// firestore.rules
match /{document=**} { allow read, write: if false; }
```

El cliente no tiene permitido leer ni escribir Firestore; todo el acceso pasa por la API con el Admin SDK. Por eso la escritura falla **después** de una autenticación correcta, y el error se propaga como si el login hubiera fallado.

## Decisión

**Quitar la escritura de cliente y actualizar la spec.** No se sustituye por una ruta con Admin SDK.

Razones:

1. **No hay consumidor.** Ningún módulo lee el documento `users/{uid}`: solo se escribía. Los datos de la persona viven en subcolecciones (`favorites`, `artists`, `recomendationHistory`) que gestiona la API. Crear el documento no aporta nada hoy.
2. **La spec ya era inexacta.** El requirement de registro por correo también prometía crear `users/{uid}`, pero `createUserWithEmailAndPassword` nunca llamó a `saveUserToFirestore`. La spec describía un comportamiento que solo existía en un camino y que las reglas rompieron.
3. **Coste y superficie.** Una ruta API autenticada solo para crear un documento que nadie lee añade código, un viaje de red tras el login y un punto más que mantener.

## Alternativas descartadas

- **Hacer la escritura no fatal** (try/catch y seguir): el login funcionaría, pero se mantiene código muerto que aparenta crear un perfil que no se crea, y el error seguiría apareciendo en consola en cada login.
- **Crear el perfil con el Admin SDK** desde una ruta API: mantiene la spec, pero resuelve un problema que no existe (nadie lee el documento) a cambio de más superficie. Si en el futuro hace falta el perfil, ese es el camino correcto y requerirá su propio change.

## Consecuencias

- El login con Google deja de depender de Firestore: si la autenticación va bien, la sesión se establece y se redirige.
- `db` de `src/lib/firebase.js` queda sin consumidores y se retira; si hiciera falta, se reintroduce junto con el flujo que lo use.
- La spec `authentication` deja de prometer un documento que no se crea, y queda coherente con `api-security` (el cliente no toca Firestore).
- **Riesgo asumido**: una futura funcionalidad que espere `users/{uid}` tendrá que crearlo en el servidor. No hay ninguna hoy.
