# Capa de servicios

Esta carpeta separa la comunicación con el exterior de las vistas y de los hooks.

## `client/`

Servicios que se ejecutan en el navegador:

- llaman a rutas internas de `src/app/api/**`;
- pueden usar Firebase Auth de cliente;
- nunca importan `services/server/**`, `firebase-admin`, `lib/firebaseAdmin` ni `lib/apiAuth`.

## `server/`

Servicios que se ejecutan en el servidor:

- hablan con Firestore, Spotify u otros servicios externos;
- empiezan con `import "server-only"`;
- pueden usar `lib/firebaseAdmin`, `lib/apiAuth`, `utils/**` y `types/**`;
- no se importan desde páginas, componentes, hooks ni servicios de cliente.

## Dirección permitida

```text
app/**/page.tsx + components/** -> hooks/** -> services/client/** -> API interna
app/api/**/route.ts             -> services/server/** -> Firestore / Spotify
utils/**                        -> types/** + constants/**
types/**                        -> solo tipos
```

Las rutas API son adaptadores HTTP: autentican, validan, llaman a un servicio de servidor y construyen la respuesta. No acceden directamente a `adminDb()`.
