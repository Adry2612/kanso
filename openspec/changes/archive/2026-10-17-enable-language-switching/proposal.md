# Proposal

## Why

La base de la internacionalización está hecha (contexto con español e inglés, **197 claves alineadas** en los dos idiomas, persistencia en `localStorage` y spec), pero **no hay forma de cambiar de idioma**:

- El antiguo `LanguageSwitcher` se eliminó por no usarse en `remove-dead-code-and-fix-lint`, y no se sustituyó.
- La sección "Preferencias" de Ajustes muestra una fila "Idioma" que dice literalmente **"Configurado desde el selector"… cuando no existe ningún selector**.
- La propia página de Ajustes está **escrita en español a pelo** (no usa traducciones), así que aunque se cambiara el idioma, seguiría en español.
- Nada aplica el idioma activo al documento, así que el `<html lang>` no coincide con la interfaz.

En resumen: la spec `internationalization` promete un cambio de idioma que hoy no se puede usar.

## What Changes

- Añadir en Ajustes un **selector de idioma** (Español / English) que cambia el idioma al instante y lo recuerda entre visitas.
- **Traducir la página de Ajustes** (namespace `settings` nuevo en ambos idiomas), para que el cambio de idioma también la alcance.
- **Aplicar el idioma activo al documento** (`<html lang>`), de modo que la interfaz y el idioma declarado coincidan.

Se mantiene el **contexto de i18n propio** (ya cumple la spec) en lugar de migrar a next-intl, que exigiría reescribir todas las llamadas de traducción.

## Capabilities

### Modified Capabilities

- `internationalization`: el cambio de idioma se ofrece en Ajustes, se aplica a toda la interfaz (incluidos los Ajustes) y se refleja en el idioma del documento.

## Impact

- `src/locales/es.json`, `src/locales/en.json` (namespace `settings`).
- `src/app/settings/page.tsx` (selector + traducciones).
- `src/context/I18nContext.tsx` (sincronizar `<html lang>`).
