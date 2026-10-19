# Diseño: armazón responsive para pantallas estrechas

## 1. Diagnóstico medido

Viewport de 390 px, contenido y desborde por ruta (antes del cambio):

| Ruta | Ancho del contenido | Desborde |
| --- | --- | --- |
| `/home` | 160 px | 98 px |
| `/favorites` | 160 px | 97 px |
| `/search` | 160 px | 63 px |
| `/artists` | 160 px | 14 px |
| `/releases` | 160 px | 87 px |
| `/settings` | 160 px | 56 px |
| `/recomendationHistory` | 160 px | 145 px |

Y a 768 px el contenido mide 538 px con el panel ocupando 230 px.

## 2. Causa raíz

El armazón es `<Header />` (panel `fixed`) más `.app-content` con
`margin-left: 230px`. El media query de 900 px hace esto:

```css
@media (max-width: 900px) {
  .kanso-sidebar { width: 230px; }
  .app-content,
  .sidebar-collapsed .app-content { margin-left: 230px; }
}
```

Es decir: **anula el colapso** justo cuando más falta hace. No hay ningún patrón
móvil detrás; el panel simplemente se queda ocupando la mitad de la pantalla.

## 3. Decisión: cajón por debajo de 1024 px

Se usa 1024 px, que es el `lg` de Tailwind y el breakpoint que ya usan las
rejillas de las páginas. Así el armazón y el contenido cambian de forma a la
vez, en lugar de tener una discontinuidad a 900 px que nadie más respeta.

- **≥ 1024 px:** panel fijo de 230 px, colapsable a 76 px. Igual que hoy.
- **< 1024 px:** panel fuera de pantalla, barra superior pegajosa con la marca y
  el botón de menú, contenido a ancho completo.

Con siete secciones más ajustes y perfil, una barra inferior no cabe con
objetivos táctiles cómodos; el cajón reutiliza la navegación que ya existe.

## 4. Reglas del colapso, acotadas

El estado `sidebar-collapsed` vive en `<body>` y persiste entre visitas. Si sus
reglas siguen siendo globales, alguien que colapsó el panel en escritorio vería
en móvil un cajón de 76 px y un contenido desplazado 76 px. Por eso **todas** las
reglas de `.sidebar-collapsed` se envuelven en `@media (min-width: 1024px)`, y el
`.app-content` recupera `margin-left: 0` por debajo. El estado guardado no se
toca: solo deja de aplicarse donde no corresponde.

## 5. Barra superior en el flujo, no flotante

La barra móvil se renderiza como `position: sticky` **en el flujo normal**, antes
de `.app-content`. Así ocupa su altura real y no hace falta compensar con
`padding-top` inventado, que es la fuente clásica de saltos y de contenido
tapado. Al hacer scroll se queda arriba.

## 6. Comportamiento del cajón

- Estado efímero `mobileOpen`, no persistido: en móvil el cajón se abre para
  navegar, no es una preferencia.
- Se cierra al cambiar de ruta (`useEffect` sobre `pathname`), con `Escape`, con
  la capa atenuada y con el botón de cerrar.
- **Foco:** al abrir entra en el cajón; mientras está abierto, `Tab` y
  `Mayús+Tab` ciclan dentro; al cerrar vuelve al botón de menú. Es lo que exige
  el escenario de foco contenido.
- **Scroll del fondo:** se bloquea mientras el cajón está abierto.
- La capa atenuada es un `<button>` con nombre accesible, no un `div` con
  `onClick`: se puede cerrar con teclado sin inventar roles.

## 7. Limpieza de paso

`.kanso-header` está definido en el CSS y no lo usa ningún componente (el panel
es `fixed` y el contenido usa `.app-content`). Se elimina: es una regla con
`margin-left: 230px` que solo puede confundir a quien lea el armazón.

## 8. Verificación

La prueba central es la misma medición que abrió el cambio: para Inicio,
Búsqueda, Artistas, Novedades, Favoritos, Historial y Ajustes, a 320, 390, 768 y
1024 px, `scrollWidth === clientWidth`. Además, revisar a ojo que ninguna
rejilla recorta por la derecha, porque un desborde interno puede quedar oculto
por un `overflow: hidden`.
