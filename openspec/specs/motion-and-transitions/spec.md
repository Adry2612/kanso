# motion-and-transitions Specification

## Purpose
Define cómo la interfaz se mueve y cómo se relacionan las vistas entre sí al navegar, para dar sensación de profundidad y fluidez sin comprometer accesibilidad ni rendimiento.

## Requirements

### Requirement: Transición entre vistas

El sistema DEBE animar el cambio entre rutas usando la View Transitions API, relacionando visualmente la vista de origen y la de destino.

#### Scenario: Navegación entre secciones

- **WHEN** la persona navega de una sección a otra
- **THEN** el sistema reproduce una transición entre la vista anterior y la nueva en lugar de un cambio instantáneo

#### Scenario: Transición compartida de portada

- **WHEN** la persona abre el detalle de un álbum desde una tarjeta
- **THEN** la portada se transforma de forma continua entre la tarjeta y el detalle

### Requirement: Aparición animada del contenido

El sistema DEBE revelar el contenido principal con una animación de entrada que puede escalonarse entre elementos relacionados. Cuando el contenido se genera tras una acción o una carga (resultados de búsqueda, listas y rejillas de datos), la animación DEBE reproducirse al montarse el contenido y no depender de que el elemento entre en el viewport, de modo que nunca quede oculto.

#### Scenario: Entrada de listas y rejillas

- **WHEN** una rejilla o lista aparece en pantalla
- **THEN** sus elementos entran de forma escalonada en lugar de aparecer todos a la vez

#### Scenario: Contenido generado tras una acción

- **WHEN** una rejilla o lista aparece como resultado de una acción o de una carga de datos
- **THEN** su animación de entrada se reproduce al aparecer, aunque el elemento ya estuviera en pantalla o la pestaña no estuviera visible, sin quedar oculto

### Requirement: Retroalimentación interactiva

El sistema DEBE dar retroalimentación visual al puntero y a la pulsación en elementos interactivos como tarjetas y botones.

#### Scenario: Interacción con una tarjeta

- **WHEN** la persona pasa el puntero sobre una tarjeta o pulsa un botón
- **THEN** el sistema responde con un cambio de elevación, escala o color perceptible

### Requirement: Respeto por el movimiento reducido

El sistema DEBE desactivar o reducir las animaciones cuando la persona tiene activada la preferencia de movimiento reducido.

#### Scenario: Movimiento reducido activo

- **WHEN** el sistema operativo del usuario indica `prefers-reduced-motion: reduce`
- **THEN** las transiciones y animaciones se muestran de forma instantánea o estática
