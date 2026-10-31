# Spec Delta

## Purpose

Define cómo se presentan las portadas de álbum en toda la aplicación para que tengan el mismo marco y el mismo comportamiento visual, independientemente de la pantalla donde aparezcan.

## ADDED Requirements

### Requirement: Marco de portada coherente

El sistema DEBE (MUST) renderizar todas las portadas de álbum con un único componente de portada compartido, de modo que buscador, novedades, colección, historial y bibliotecas compartidas muestren el mismo marco cuadrado, radio, borde, fondo y degradado inferior. Las tarjetas DEBEN (MUST) conservar sus datos y acciones propios sin duplicar el marcado de la portada.

#### Scenario: Buscador y novedades

- **WHEN** la persona ve álbumes en los resultados del buscador o en la página de novedades
- **THEN** cada portada presenta el mismo marco, radio, borde y degradado que la portada de la colección y del historial

#### Scenario: Colección e historial

- **WHEN** la persona ve álbumes en la colección o en el historial, en cuadrícula o en lista
- **THEN** las portadas mantienen el marco compartido en ambos formatos y vistas

#### Scenario: Biblioteca compartida

- **WHEN** la persona consulta la biblioteca compartida de otra cuenta
- **THEN** las portadas usan el mismo marco compartido que en el resto de la aplicación

### Requirement: Composición de la tarjeta de resultados del buscador

Las tarjetas de resultados del buscador DEBEN (MUST) presentar la portada como pieza principal, con la misma composición que la colección y el historial: sin un panel que la enmarque por duplicado y sin elevar la tarjeta al pasar el puntero. El zoom DEBE (MUST) limitarse a la imagen dentro del marco. DEBEN (MUST) conservar el botón de añadir y los estados de colección y pendientes.

#### Scenario: Resultados del buscador

- **WHEN** la persona ve álbumes en los resultados del buscador
- **THEN** cada tarjeta muestra la portada como pieza principal, sin panel envolvente ni marco duplicado, con el mismo tratamiento que la colección y el historial

#### Scenario: Hover en el buscador

- **WHEN** la persona pasa el puntero sobre una tarjeta de resultados
- **THEN** solo se amplía la imagen dentro del marco; la tarjeta no se eleva ni se desplaza

#### Scenario: Acción de añadir

- **WHEN** la persona ve un resultado que no está en su colección o que está en pendientes
- **THEN** la tarjeta conserva el botón de añadir y el estado correspondiente

#### Scenario: Álbumes de la comunidad

- **WHEN** la persona ve el bloque «Añadidos por la comunidad»
- **THEN** las tarjetas usan la misma composición que los resultados del buscador

### Requirement: Comportamiento y respaldo de la portada

La portada DEBE (MUST) cargarse de forma diferida, ampliarse ligeramente al pasar el puntero cuando la tarjeta lo permita y mostrar un icono de reserva cuando el álbum no tenga imagen, sin cambiar el tamaño del marco ni provocar saltos de diseño.

#### Scenario: Álbum sin imagen

- **WHEN** el álbum no tiene ninguna imagen disponible
- **THEN** el marco conserva su tamaño y muestra un icono de reserva centrado

#### Scenario: Puntero sobre la tarjeta

- **WHEN** la persona pasa el puntero sobre una portada con imagen
- **THEN** la imagen se amplía ligeramente dentro del marco sin desbordarlo

#### Scenario: Carga diferida

- **WHEN** una portada queda fuera de la vista inicial
- **THEN** su imagen se carga de forma diferida sin reservar un tamaño distinto al definitivo
