# Diseño: renombrar la marca a Kanso

## 1. Inventario real (medido, no estimado)

| Qué | Dónde | Cuántos |
| --- | --- | --- |
| Variables CSS `--collectify-*` | `src/app/globals.css` | 7 |
| Clases `collectify-*` | `src/app/globals.css` + 20 componentes y páginas | 16 |
| Usos de esas variables en `className` arbitrario | todo `src/` | 414 |
| Claves de `localStorage` | `ThemeProvider`, `Header` | 2 |
| Textos «Collectify» con mayúscula | `locales`, `layout`, `page`, `login`, `globals.css` | 16 |
| Documentación | `README.md`, `docs/TRADUCCIONES.md`, `firestore.rules` | 8 |

Las 7 variables son `danger`, `lime`, `line`, `line-strong`, `mint`, `muted` y
`panel`. Las 16 clases cubren esas mismas palabras más `brand`, `card`,
`header`, `input`, `link`, `main`, `page-title`, `section-title` y `sidebar`.

## 2. Una sola sustitución, no dos

Variables y clases comparten el prefijo literal `collectify-` (`--collectify-mint`
frente a `collectify-mint`). Por eso **una única sustitución de `collectify-` por
`kanso-`** cubre variables, clases y las dos claves de almacenamiento a la vez,
sin necesidad de enumerar nada. Ese es el motivo de no usar «renombrar
símbolo por símbolo»: es más código y más fácil de dejar a medias.

Los textos con mayúscula («Collectify») **no** entran en esa sustitución —la `C`
lo rompe— y van aparte, en una pasada propia más pequeña y revisable.

## 3. Todo o nada

El renombrado de clases no produce error de compilación si queda a medias: una
clase mal renombrada simplemente no aplica estilo y la pantalla se ve rara, sin
avisar. Por eso:

- Se sustituye el prefijo en **todo** `src/` de una vez, no archivo a archivo.
- La verificación termina con una búsqueda de `collectify` en `src/` que debe
  devolver solo las **dos** cadenas de la clave anterior (`collectify-theme` y
  `collectify-sidebar-collapsed`), que la migración de la sección 4 necesita leer
  una vez. Cualquier otra aparición es un resto que se ha quedado atrás.
- Se revisa a ojo que el panel, el tema y el modal sigan pintados, porque es lo
  único que detecta una clase perdida.

## 4. Preferencias guardadas

Renombrar la clave sin más haría que quien ya usaba la aplicación perdiera el
tema y el estado del panel. La migración es de una línea por sitio:

```ts
const value = window.localStorage.getItem("kanso-theme")
  ?? window.localStorage.getItem("collectify-theme");
```

Se lee la nueva y, solo si no está, la anterior. Se escribe siempre la nueva, así
que la migración se resuelve sola en el primer guardado y la clave vieja queda
inerte. No se borra la anterior: no molesta y evita sorpresas si alguien vuelve a
una versión antigua. La clave del idioma (`locale`) ya era neutra y no se toca.

## 5. Logotipo e iconos

El origen `kanso-logo.png` mide 202×189: no es cuadrado, y un favicon sí debe
serlo. Se cuadra **rellenando con transparencia**, sin recortar, para no comerse
el borde verde del redondeo.

Se generan con `sharp` (ya está en `node_modules`, es dependencia de Next):

- `src/app/icon.png` (512×512): Next lo enlaza solo como icono del navegador.
- `src/app/apple-icon.png` (180×180): icono para pantallas de inicio.
- `src/app/favicon.ico`: varios tamaños en un solo archivo, con PNG incrustados
  (el formato ICO moderno lo admite). Sustituye al actual, que aún es el de
  Next.
- `public/kanso-logo.png`: el cuadrado con transparencia, para el uso dentro de
  la interfaz.

No se añade ninguna dependencia nueva: `sharp` ya venía con Next y el
empaquetado del ICO se escribe a mano (cabecera de 6 bytes, un directorio de 16
por imagen y los PNG a continuación).

## 6. Dónde entra el logo en la interfaz

Tres sitios ya pintaban la marca como texto plano: la bienvenida, la pantalla de
acceso (dos variantes, móvil y escritorio) y el panel lateral. En los tres el
logo sustituye a la palabra suelta y acompaña al nombre, reutilizando el hueco
que ya existía (`flex items-center gap-3`), así que no se toca la maquetación.

En el panel, el logotipo **no** lleva la clase `sidebar-label` (la que se oculta
al colapsar): así el panel colapsado se queda con el logo como única marca, que
es justo lo que conviene cuando solo caben 76 px.

## 7. Riesgo y alcance

El riesgo real es el de la sección 3: una clase perdida no da error. El resto es
mecánico y se verifica con una búsqueda, un `tsc`, un `lint` y un `build`.

Lo que se deja fuera y por qué (project id de Firebase, Sentry, históricos
archivados y mockups) está en la propuesta: no son decisiones del código, son
identificadores inmutables o registros que no se reescriben.
