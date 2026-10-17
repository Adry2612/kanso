# Design

## Context

Ver `proposal.md` — Why. `globals.css` define los tokens en `:root` (oscuro) y los sobrescribe en `.theme-light`. La landing usa tokens; la app no. Medido: 66 clases de color distintas, 495 ocurrencias, en 30 ficheros (de los que 7 son código muerto).

## Goals / Non-Goals

**Goals:**

- Que toda pantalla viva sea legible en tema claro y oscuro sin tocar su estructura.
- Un único mapa de equivalencias, aplicado de forma uniforme.

**Non-Goals:**

- Cambiar layouts, jerarquía o copy (salvo lo ya hecho en `redesign-home-and-selector`).
- Rediseñar los temas o añadir un tercero.
- Tocar código muerto (va a `remove-dead-code-and-fix-lint`).

## Decisions

### 1. Mapa de equivalencias

Los literales de la paleta oscura se sustituyen por tokens:

| Literal | Token |
| --- | --- |
| `text-white`, `text-[#f2f5ef]`, `text-[#d6e5d8]`, `text-[#1b2b20]`, `text-[#233321]` | `text-[var(--foreground)]` |
| `text-[#8f9f93]`, `text-[#b4c2b6]`, `text-[#657468]`, `text-[#617164]`, `text-[#5e7162]`, `text-gray-300` | `text-[var(--collectify-muted)]` |
| `text-[#9be7a5]`, `text-[#368b52]`, `text-emerald-100` | `text-[var(--collectify-mint)]` |
| `text-[#102117]`, `text-emerald-950` | `text-[var(--background)]` |
| `text-[#ff9f76]`, `text-[#ffb292]` | `text-[var(--collectify-danger)]` |
| `bg-[#9be7a5]`, `bg-[#368b52]` | `bg-[var(--collectify-mint)]` |
| `bg-[#d6f28d]` | `bg-[var(--collectify-lime)]` |
| `bg-[#ff9f76]` | `bg-[var(--collectify-danger)]` |
| `bg-[#17261c]`, `bg-[#101b14]`, `bg-[#f1f5ef]` | `bg-[var(--surface-1)]` |
| `bg-[#203a29]`, `bg-[#294331]`, `bg-[#d9e6da]`, `bg-emerald-100/20`, `bg-emerald-900/30`, `bg-emerald-900/50` | `bg-[var(--surface-3)]` |
| `bg-emerald-100/10`, `bg-emerald-900/5`, `bg-emerald-300/10`, `bg-white/[0.03]` | `bg-[var(--surface-2)]` |
| `border-[#9be7a5]`, `ring-[#9be7a5]` | `border/ring-[var(--collectify-mint)]` |
| `border-emerald-100/10`, `border-emerald-200/10`, `border-emerald-200/15`, `border-emerald-200/20`, `border-emerald-900/10`, `border-emerald-900/15` | `border-[var(--collectify-line)]` |
| `border-emerald-100/15`, `border-emerald-300/30` | `border-[var(--collectify-line-strong)]` |
| `border-[#ff9f76]` | `border-[var(--collectify-danger)]` |

Se preserva `bg-[#d1a578]` (avatar, color de marca deliberado) y los degradados sobre imagen (`from-black/40`), que son independientes del tema.

**Alternativas consideradas**

- _Fijar el tema oscuro por defecto y no migrar_: contradice `appearance-settings` (claro por defecto) y tira la identidad de la landing. Descartada.
- _Migrar a mano fichero a fichero sin mapa_: 495 sustituciones homogéneas; el mapa garantiza uniformidad. Descartada la vía manual.

### 2. Ejecución por sustitución ordenada + revisión

Se aplica el mapa por sustitución de subcadenas (de la clave más larga a la más corta para evitar colisiones), y después se revisa que no queden literales de la paleta en ficheros vivos y que `tsc`/`lint` sigan limpios. Verificación visual en claro y oscuro sobre las pantallas principales.

### 3. Tokens que faltaban

`--surface-*`, `--collectify-line-strong` y `--collectify-danger` no existían en el tema claro; se añaden para que la migración tenga destino.

## Risks / Trade-offs

- [Sustitución global en un fichero con uso legítimo de un literal] → se revisan los casos con degradados/image scrim y se preservan.
- [Quedan restos no detectados por el mapa] → barrido final buscando literales `[#` y colores de `emerald/neutral/gray`.

## Migration Plan

Sin migración de datos. Cambio de estilos. Despliegue normal.

## Open Questions

- Ninguna.
