# Armazón responsive para pantallas estrechas

## Por qué

Por debajo de 900 px la aplicación no tiene navegación móvil: el panel lateral
sigue ocupando 230 px y el contenido se queda con lo que sobra. Medido en el
navegador, con un viewport de 390 px el área de contenido queda en **160 px** y
**todas** las pantallas privadas desbordan en horizontal, entre 14 px
(`/artists`) y 145 px (`/recomendationHistory`).

La causa es un media query que hace lo contrario de lo que parece: a partir de
900 px **fuerza** el panel a 230 px e **ignora** el estado colapsado. O sea que
en móvil ni siquiera sirve colapsar el panel, porque el CSS lo vuelve a abrir.

Además, aunque a 768 px no hay desborde, el panel se come el 30 % del ancho para
siete enlaces que no caben en una barra inferior.

## Qué cambia

- **Cajón en pantallas estrechas.** Por debajo de 1024 px el panel pasa a ser un
  cajón superpuesto, con una barra superior con la marca y un botón de menú. El
  contenido ocupa el ancho completo.
- **Escritorio intacto.** A partir de 1024 px todo sigue igual: panel fijo y
  colapsable, con su estado recordado. Las reglas del colapso se limitan a ese
  rango para que no afecten al móvil.
- **Sin desborde horizontal.** Ninguna pantalla privada desplaza en horizontal
  entre 320 px y escritorio, con el panel abierto o cerrado.
- **Accesible.** El cajón se abre y se cierra con el botón, la capa, `Escape` o
  al cambiar de sección; el foco entra en el cajón, no se escapa de él mientras
  está abierto y vuelve al botón que lo abrió. Se bloquea el scroll del fondo.

## Fuera de alcance

- Rediseñar las rejillas y tarjetas de cada pantalla: el cambio arregla el
  armazón y verifica que el contenido quepa; si alguna pantalla concreta sigue
  apretada, se aborda en su propio cambio.
- La barra inferior tipo aplicación nativa: con siete secciones más ajustes y
  perfil no cabe con objetivos táctiles cómodos.
- Las páginas públicas (`/` y `/login`), que no usan el panel y ya son
  responsivas.
