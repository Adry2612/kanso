# Tasks

## 1. Quitar la escritura de cliente

- [x] 1.1 Eliminar `saveUserToFirestore` y su llamada en `signInWithGoogle`, junto con el import de `firebase/firestore`, en `src/lib/firebaseAuth.js`; verificar que el módulo ya no importa Firestore
- [x] 1.2 Retirar el export `db` de `src/lib/firebase.js` y comprobar con `grep` que ningún módulo lo importa

## 2. Verificación

- [x] 2.1 Ejecutar `npx tsc --noEmit`, `npm run lint` y `npm run build` sin errores (build exit 0)
- [x] 2.2 Confirmar que no queda ninguna lectura ni escritura de Firestore desde el cliente: `grep -rn "firebase/firestore" src/` no devuelve resultados
- [x] 2.3 Verificar el flujo de Google: el popup abre con un clic real y solo se consulta Auth. Instrumentando `fetch`/`XHR` durante el login **no hay ninguna petición a Firestore** (solo `identitytoolkit` y la API propia). **Limitación**: no se puede completar el consentimiento de Google con una cuenta real desde el entorno automatizado; la comprobación definitiva de que se llega a `/home` la hace la persona con su cuenta
- [x] 2.4 Verificar que el registro con correo, el inicio con correo y el modo invitado siguen funcionando igual: el **invitado** llega a `/home` sin errores. El **correo** no se puede verificar en este entorno porque el proveedor Email/Password está desactivado en la consola de Firebase (`auth/operation-not-allowed`), una configuración ajena a este change y previa a él

## 3. Cierre

- [x] 3.1 Revisión del usuario del resultado en `npm run dev`
- [x] 3.2 Archivar el change y sincronizar el delta con `openspec/specs/authentication/spec.md`

## Notas de implementación

- La instrumentación de red confirma el diagnóstico: tras autenticar solo se llama a `identitytoolkit.googleapis.com`; antes del arreglo, `saveUserToFirestore` provocaba la escritura denegada por `firestore.rules`.
- El botón de Google sigue mostrando "Cargando…" mientras el popup está abierto; si el popup se bloquea, no hay timeout y el botón queda deshabilitado (follow-up, fuera de alcance).

## Fuera de alcance

- Crear `users/{uid}` con el Admin SDK.
- Robustez del botón de Google ante popup bloqueado (timeout o `signInWithRedirect`).
- Activar el proveedor Email/Password en la consola de Firebase.
