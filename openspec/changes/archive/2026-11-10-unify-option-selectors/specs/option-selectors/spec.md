# Spec Delta

## Purpose

Define un sistema único de selectores de opción para que emoción, actividad y formato compartan botón, carril, rejilla, estados y accesibilidad en toda la aplicación.

## ADDED Requirements

### Requirement: Selector compartido de opciones

El sistema DEBE (MUST) usar un único sistema de selectores para emoción, actividad y formato, con el mismo botón, carril y rejilla, y con estados seleccionado, activo, foco y deshabilitado idénticos en tema claro y oscuro.

#### Scenario: Emoción y actividad

- **WHEN** la persona ve el selector de emociones y el de actividades en el inicio o en el asistente
- **THEN** ambos usan el mismo botón, el mismo espaciado y los mismos estados visuales

#### Scenario: Formato

- **WHEN** la persona ve los formatos en la recomendación rápida, en el asistente o en el filtro de la colección
- **THEN** los tres usan el mismo botón y los mismos estados que emoción y actividad

#### Scenario: Ambos temas

- **WHEN** la persona cambia entre tema claro y oscuro
- **THEN** los estados de los selectores mantienen el mismo contraste y jerarquía visual

### Requirement: Opciones de formato con icono

Cada opción de formato DEBE (MUST) mostrar un icono junto a su etiqueta —digital, vinilo, CD, casete y toda la colección—. El icono DEBE (MUST) ser decorativo y la etiqueta DEBE (MUST) seguir siendo el nombre accesible.

#### Scenario: Iconos visibles

- **WHEN** la persona abre un selector de formato
- **THEN** cada opción muestra su icono y su etiqueta, sin que el icono sustituya al texto

#### Scenario: Nombre accesible

- **WHEN** una tecnología de asistencia lee una opción de formato
- **THEN** anuncia la etiqueta del formato y no el icono decorativo

#### Scenario: Toda la colección

- **WHEN** la persona elige la opción de explorar toda la colección
- **THEN** la opción muestra su icono propio y se distingue de los formatos físicos

### Requirement: Carrusel sin recorte prematuro

Al desplazarse hasta el final de un carrusel de opciones, el último elemento DEBE (MUST) verse completo. El recorte DEBE (MUST) ocurrir solo en el borde del contenedor, nunca antes de terminar su ancho visible.

#### Scenario: Final del carrusel

- **WHEN** la persona llega al final del carril con arrastre, rueda o flechas
- **THEN** el último elemento se ve entero, incluido su medallón o icono y su etiqueta

#### Scenario: Mitad del carrusel

- **WHEN** la persona se desplaza por opciones intermedias
- **THEN** los elementos se recortan solo en los bordes reales del contenedor

#### Scenario: Anchos extremos

- **WHEN** el carrusel se muestra a 320, 390, 768 y 1440 px
- **THEN** el último elemento sigue siendo alcanzable y visible por completo en todos los anchos

#### Scenario: Teclado

- **WHEN** la persona recorre el carrusel con las flechas o con Inicio y Fin
- **THEN** la opción enfocada queda visible y el carril no deja el último elemento cortado

### Requirement: Accesibilidad y comportamiento conservados

El selector compartido DEBE (MUST) conservar los roles, la selección múltiple o única, el recorrido con teclado, el buscador de emociones y actividades y el respeto al movimiento reducido.

#### Scenario: Selección múltiple y única

- **WHEN** la persona selecciona emociones o elige una actividad
- **THEN** la primera sigue permitiendo varias y la segunda una sola, como hasta ahora

#### Scenario: Buscador

- **WHEN** la persona filtra emociones o actividades por texto
- **THEN** el selector compartido muestra solo las coincidencias y conserva la selección previa

#### Scenario: Movimiento reducido

- **WHEN** el sistema operativo indica movimiento reducido
- **THEN** el carril se desplaza sin animación o permanece estático

#### Scenario: Foco visible

- **WHEN** la persona navega con teclado
- **THEN** la opción enfocada muestra un foco visible en ambos temas
