# Tasks

## 1. Identificadores internos (todo o nada)

- [x] 1.1 Sustituir el prefijo `collectify-` por `kanso-` en todo `src/`: cubre las 7 variables CSS, las 16 clases y las 2 claves de almacenamiento de una sola pasada (26 archivos)
- [x] 1.2 Comprobar con una búsqueda que en `src/` no queda ningún `collectify-` salvo las dos cadenas de migración (`collectify-theme` y `collectify-sidebar-collapsed`)
- [x] 1.3 Revisar a ojo que el panel, el tema claro/oscuro y el modal siguen pintados (una clase perdida no da error de compilación)

## 2. Preferencias guardadas

- [x] 2.1 `ThemeProvider`: leer `kanso-theme` y, solo si no está, `collectify-theme`; escribir siempre la nueva
- [x] 2.2 `Header`: lo mismo con `kanso-sidebar-collapsed` y `collectify-sidebar-collapsed`
- [x] 2.3 Verificar que con la clave vieja escrita a mano se aplica la preferencia y se guarda bajo la nueva (tema oscuro y panel colapsado migrados; la clave antigua queda inerte, no se borra)

## 3. Marca visible

- [x] 3.1 Cambiar «Collectify» por «Kanso» en `layout.tsx` (título y descripción), `page.tsx`, `login/page.tsx`, los dos locales y el comentario de `globals.css`
- [x] 3.2 Revisar los textos que nombran la marca: el título del documento y las copias quedan correctos, sin frases raras
- [x] 3.3 Colocar el logotipo junto al nombre en la bienvenida, el acceso (móvil y escritorio) y el panel lateral, sin tocar la maquetación existente
- [x] 3.4 En el panel, el logotipo no lleva `sidebar-label` para que el panel colapsado conserve la marca (verificado a 28×28 en ambos estados)

## 4. Iconos

- [x] 4.1 Cuadrar el logotipo de origen rellenando con transparencia (202×189 → 202×202) y guardarlo en `public/kanso-logo.png` a 512×512
- [x] 4.2 Generar `src/app/icon.png` (512×512) y `src/app/apple-icon.png` (180×180) con `sharp`, sin añadir dependencias
- [x] 4.3 Empaquetar `src/app/favicon.ico` multi-tamaño (16, 32 y 48) con PNG incrustados; Next enlaza los tres iconos y todos se sirven con 200

## 5. Documentación

- [x] 5.1 Actualizar `README.md` (título, rutas de clonado, estructura y despliegue)
- [x] 5.2 Actualizar `docs/TRADUCCIONES.md` y el comentario de `firestore.rules`

## 6. Verificación

- [x] 6.1 `npx tsc --noEmit`, `npm run lint` y `npm run build` sin errores
- [x] 6.2 `openspec validate rename-brand-to-kanso`
- [x] 6.3 Revisar la marca en tema claro y oscuro y en móvil y escritorio
- [x] 6.4 Verificar que la pestaña del navegador muestra el logotipo nuevo

## Notas de implementación

- El logo quedaba clampeado a 19 px en el panel colapsado: el preflight de
  Tailwind aplica `img { max-width: 100% }` y el botón de marca se ajusta al
  contenido. Se resuelve con `max-w-none`, no cambiando la maquetación.
- El origen tiene transparencia real (alfa 0 en la esquina), así que el cuadrado
  se rellena con alfa y no con un color de fondo.

## Fuera de alcance

- El *project id* de Firebase (y su dominio, bucket y proyecto de Sentry): son
  inmutables en el proveedor. Se quedan como están, documentado en la propuesta.
- Renombrar la carpeta local del repositorio: rompería la ruta absoluta de
  `FIREBASE_SERVICE_ACCOUNT_PATH` en `.env`. Si se hace, va aparte.
- `openspec/changes/archive/**` y los mockups de `public/*.html`.
