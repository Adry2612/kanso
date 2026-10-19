# Spec Delta

## MODIFIED Requirements

### Requirement: Panel colapsable

En pantallas anchas (desde 1024 px), el sistema DEBE permitir colapsar y expandir el panel lateral recordando el estado. Por debajo de ese ancho, el panel DEBE comportarse como un cajón superpuesto que se abre y se cierra sin reducir el ancho del contenido.

#### Scenario: Colapsar el panel

- **WHEN** la persona colapsa el panel en una pantalla ancha
- **THEN** el sistema lo contrae, guarda el estado y el contenido ocupa el espacio liberado

#### Scenario: Restauración del estado

- **WHEN** la persona vuelve a abrir la aplicación en una pantalla ancha
- **THEN** el sistema restaura el estado colapsado o expandido guardado

#### Scenario: Preferencia heredada en pantalla estrecha

- **WHEN** la persona abre una pantalla estrecha con el panel guardado como colapsado
- **THEN** el contenido ocupa el ancho completo y el panel se comporta como cajón, no como columna de 76 px

## ADDED Requirements

### Requirement: Navegación en pantallas estrechas

Por debajo de 1024 px, el sistema DEBE ocultar el panel lateral y ofrecer una barra superior con la marca y un botón que lo abra como cajón superpuesto, DEBE cerrarlo con ese botón, con la capa atenuada, con `Escape` o al cambiar de sección, y DEBE devolver el foco al botón que lo abrió.

#### Scenario: Abrir el menú

- **WHEN** la persona pulsa el botón de menú en una pantalla estrecha
- **THEN** el panel entra como cajón superpuesto, el fondo se atenúa y el foco entra en el cajón

#### Scenario: Cerrar sin navegar

- **WHEN** la persona pulsa la capa atenuada, el botón de cerrar o `Escape`
- **THEN** el cajón se oculta, el fondo recupera su scroll y el foco vuelve al botón de menú

#### Scenario: Cambiar de sección

- **WHEN** la persona elige una sección desde el cajón
- **THEN** el sistema navega y el cajón se cierra solo

#### Scenario: Foco contenido

- **WHEN** la persona recorre el cajón abierto con `Tab` o `Mayús+Tab`
- **THEN** el foco recorre solo los elementos del cajón y no se escapa al contenido de detrás

#### Scenario: Escritorio intacto

- **WHEN** la persona abre la aplicación con 1024 px o más
- **THEN** no aparece la barra superior de menú y el panel sigue fijo y colapsable

### Requirement: Sin desborde horizontal

Todas las pantallas privadas DEBEN caber en el ancho del viewport sin desplazamiento horizontal, desde 320 px hasta escritorio, con el panel abierto o cerrado.

#### Scenario: Pantalla estrecha

- **WHEN** la persona abre cualquier sección privada con un viewport de 320 a 1023 px
- **THEN** no hay desplazamiento horizontal y el contenido ocupa el ancho disponible

#### Scenario: Recorrido de todas las secciones

- **WHEN** se revisan Inicio, Búsqueda, Artistas, Novedades, Favoritos, Historial y Ajustes a 320, 390 y 768 px
- **THEN** ninguna desplaza en horizontal ni recorta contenido por la derecha
