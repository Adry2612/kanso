# Design

## Context

Ver `proposal.md` — Why. `I18nContext` ya expone `locale` y `setLocale`, persiste en `localStorage` (`"locale"`) y resuelve claves anidadas. `settings/page.tsx` tiene los textos en español y una fila "Idioma" que remite a un selector inexistente. `src/i18n.ts` y `src/i18n/routing.ts` existen para next-intl y **`i18n.ts` es entry point** del plugin, aunque la app no usa sus hooks.

## Goals / Non-Goals

**Goals:**

- Que el cambio de idioma funcione de verdad y se pueda deshacer.
- Que Ajustes (donde vive el control) también esté traducida.
- Que el documento declare el idioma correcto.

**Non-Goals:**

- Migrar a next-intl (reescribiría todas las traducciones; el contexto propio ya cumple la spec).
- Traducir contenido musical (títulos de discos, nombres de artistas).
- Añadir más idiomas que español e inglés.

## Decisions

### 1. Selector en Ajustes, junto al tema

El control se coloca en la sección "Preferencias" de Ajustes, reemplazando el texto "Configurado desde el selector", con el mismo patrón de píldora que el selector de tema para que se sienta parte del sistema. Se enlaza directamente a `locale`/`setLocale` del contexto.

**Alternativas consideradas**

- _Selector en el header global_: expone una preferencia secundaria en todas las pantallas; Ajustes es su sitio, igual que el tema. Descartada.
- _Migrar a next-intl_: coste enorme en renombrados para el mismo resultado. Descartada.

### 2. Traducir Ajustes con un namespace `settings`

Se añade un namespace `settings` (mismo número de claves en español e inglés) y la página pasa a usarlo. Así el requisito "toda la interfaz" se cumple literalmente, sin dejar Ajustes como la única pantalla que ignora el idioma.

### 3. Sincronizar `<html lang>`

`I18nProvider` aplica `document.documentElement.lang = locale` en un efecto. Efecto secundario útil: el formateo de fecha de la home, que ya lee ese atributo, pasa a formatearse en el idioma activo.

## Risks / Trade-offs

- [Desajuste de hidratación al cargar el idioma guardado] → el idioma se resuelve en un efecto tras montar; Ajustes muestra el estado tras montar, como ya hace la home.
- [Textos sin traducir en pantallas no auditadas] → este change traduce Ajustes; si aparecen otras sin traducir se corrigen aparte.

## Migration Plan

Sin migración de datos. La preferencia se guarda en `localStorage` con la clave `"locale"`. Despliegue normal.

## Open Questions

- ¿Dejar el andamiaje de next-intl (`i18n/routing.ts`) o retirarlo? Se decide aparte; hoy no molesta.
