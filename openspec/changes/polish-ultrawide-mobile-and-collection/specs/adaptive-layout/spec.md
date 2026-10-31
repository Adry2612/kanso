# Spec Delta

## Purpose

Define cómo se presenta el fondo decorativo y cómo crece la composición del contenido en pantallas anchas, para que la interfaz mantenga continuidad visual y aproveche el espacio sin perder legibilidad.

## ADDED Requirements

### Requirement: Fondo continuo en todo el viewport

El sistema DEBE (MUST) pintar el sombreado decorativo de cada pantalla sobre el viewport completo, con independencia del ancho máximo del contenido, sin costuras, bandas vacías ni cortes visibles en los bordes del área de contenido. La continuidad DEBE mantenerse al hacer scroll, en tema claro y oscuro, y también en las pantallas que añaden un degradado propio a partir del color de un álbum.

#### Scenario: Pantalla ultrawide en tema oscuro

- **WHEN** la persona abre una pantalla privada en un viewport de 2560 px o más con el tema oscuro
- **THEN** el fondo y su sombreado cubren todo el ancho visible sin que aparezca una línea o franja donde termina el contenido

#### Scenario: Pantalla ultrawide en tema claro

- **WHEN** la persona abre la misma pantalla con el tema claro
- **THEN** el sombreado claro cubre también todo el ancho visible y no deja un borde duro ni una zona sin teñir

#### Scenario: Pantalla con degradado de álbum

- **WHEN** la persona abre la ficha de un álbum o el resultado de una recomendación en una pantalla ultrawide
- **THEN** el degradado derivado de la portada se extiende por todo el fondo y no queda recortado al ancho del bloque de contenido

#### Scenario: Contenido más alto que el viewport

- **WHEN** la persona se desplaza por una pantalla larga en una pantalla ultrawide
- **THEN** el fondo sigue cubriendo el área visible sin cortes ni cambios bruscos de tono

### Requirement: Composición adaptativa en pantallas ultrawide

El sistema DEBE (MUST) ampliar el ancho máximo y la distribución del contenido por tramos a partir de 1600 px, aprovechando el espacio con más columnas y bloques laterales cuando la pantalla lo permita, sin estirar textos hasta perder legibilidad ni provocar desplazamiento horizontal. Por debajo de 1600 px la composición actual DEBE mantenerse.

#### Scenario: Escritorio estándar

- **WHEN** la persona abre la aplicación con un ancho entre 1024 y 1599 px
- **THEN** la composición, los anchos máximos y el número de columnas se mantienen como hasta ahora

#### Scenario: Ultrawide moderado

- **WHEN** la persona abre una pantalla con un ancho entre 1600 y 2199 px
- **THEN** el contenido ocupa un ancho máximo mayor y las rejillas muestran columnas adicionales cuando hay elementos suficientes

#### Scenario: Ultrawide amplio

- **WHEN** la persona abre una pantalla con 2200 px o más
- **THEN** el contenido aprovecha el espacio con una composición más ancha y distribuida, sin bloques flotando en el centro ni franjas laterales desproporcionadas

#### Scenario: Legibilidad de textos

- **WHEN** el contenido crece en una pantalla ultrawide
- **THEN** los párrafos y títulos conservan una longitud de línea legible y no se estiran de borde a borde

#### Scenario: Sin desplazamiento horizontal

- **WHEN** la persona abre cualquier pantalla privada en un viewport ultrawide
- **THEN** no aparece desplazamiento horizontal y ningún elemento queda recortado
