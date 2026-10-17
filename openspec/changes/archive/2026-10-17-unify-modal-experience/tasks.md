# Tasks

## 1. Shell de modal único

- [x] 1.1 Crear el shell de modal (cabecera, cuerpo, acciones, botón de cierre único, variante hero opcional) y las clases unificadas en `src/app/globals.css` (radio grande del shell, radio medio para acciones/inputs, acciones primaria/secundaria/destructiva); verificar con `npx tsc --noEmit` y `npm run build`
- [x] 1.2 Documentar en el shell la regla de radios y de acciones elegida; verificar por lectura que no quedan radios/estilos ad-hoc en el shell

## 2. Migrar los modales simples

- [x] 2.1 Reconstruir `src/components/BaseModal.tsx` sobre el shell unificado conservando su API y migrar `SortModal` y `FilterModal`; verificar que Ordenar y Filtrar abren y funcionan igual
- [ ] 2.2 Comprobar Ordenar y Filtrar en tema claro y oscuro; verificar que comparten cierre, cabecera y estilos de acción

## 3. Migrar los modales de álbum

- [x] 3.1 Migrar `SaveAlbumModal`, `SuccessAlbumModal` y `AlbumAlreadyFavoriteStep` al shell unificado, aportando el hero (fondo de artista + portada flotante) como slot; verificar que el asistente de 3 pasos conserva su scroll y max-height y que el flujo guardar/editar/eliminar funciona
- [ ] 3.2 Verificar el uso desde `src/app/albums/[albumId]/page.tsx` (añadir/editar/eliminar desde el detalle) y `SelectedAlbumModal`; comprobar los tres estados en ambos temas

## 4. Verificación de integración

- [x] 4.1 Ejecutar `npx tsc --noEmit`, `npm run lint` sin errores nuevos y `npm run build` completando correctamente
- [ ] 4.2 Prueba manual: abrir los cinco modales (Ordenar, Filtrar, Guardar/Editar, Éxito, Ya en colección) y comprobar que comparten superficie, radios, tipografía de título, cierre y jerarquía de acciones en claro y oscuro

## Workflow follow-up

- Archivar el change tras la revisión del usuario.
- Verificar el resultado archivado.
