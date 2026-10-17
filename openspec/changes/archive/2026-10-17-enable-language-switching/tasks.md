# Tasks

## 1. Traducciones

- [x] 1.1 Añadir el namespace `settings` a `src/locales/es.json` y `src/locales/en.json` (mismas claves en ambos)
- [x] 1.2 Traducir `src/app/settings/page.tsx` usando el namespace `settings` (incluidas las etiquetas del selector de tema)

## 2. Selector de idioma

- [x] 2.1 Sustituir la fila "Configurado desde el selector" por un selector Español / English enlazado a `locale`/`setLocale`
- [x] 2.2 Sincronizar `document.documentElement.lang` con el idioma activo en `src/context/I18nContext.tsx`

## 3. Verificación

- [x] 3.1 Comprobar en el navegador: cambiar a English cambia Ajustes y el resto de la interfaz al instante; el `<html lang>` pasa a `en`; recargar mantiene el idioma
- [x] 3.2 `npx tsc --noEmit`, `npm run lint` y `npm run build` sin errores
