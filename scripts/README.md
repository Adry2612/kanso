# Scripts de mantenimiento

Los scripts leen la service account de Firebase desde `.env` o del entorno:

- `FIREBASE_SERVICE_ACCOUNT_PATH` (ruta al JSON)
- `FIREBASE_SERVICE_ACCOUNT_BASE64`
- `FIREBASE_SERVICE_ACCOUNT`

## `migrate-tags.mjs`

Reescribe las etiquetas de idioma y género de `users/{uid}/collection` a sus
claves canónicas (`idioma: en`, `género: electronic`). Las variantes heredadas
—`Inglés`, `English`, `Electrónica`, `genero`, `genre`…— se resuelven con el
catálogo de `src/constants/taxonomy.json`.

```bash
# Simulación: informa sin escribir nada
npm run migrate:tags:dry

# Simulación de una sola cuenta
node scripts/migrate-tags.mjs --dry-run --user <uid>

# Migración real
npm run migrate:tags
```

El informe muestra documentos cambiados, conflictos (cuando había más de un
idioma o género y se conserva el primero) y valores no reconocidos. **Los
valores no reconocidos no se borran**: se dejan intactos para revisarlos a mano.

Antes de ejecutar la migración real, haz una copia de seguridad o exporta
`users/*/collection`. El script es idempotente: un segundo pase no modifica
ningún documento.

## `migrate-collection.mjs`

Migra `users/{uid}/favorites` a `users/{uid}/collection`. Consulta la cabecera
del propio script para las opciones (`--dry-run`, `--delete-source`, `--user`).
