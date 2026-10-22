# Spec Delta

## Purpose

Define cómo se comporta la interfaz en pantallas estrechas cuando el navegador móvil cambia su área visible: scroll contenido, altura dinámica, áreas seguras y estabilidad al enfocar campos con el teclado abierto.

## ADDED Requirements

### Requirement: Scroll contenido en pantallas estrechas

Por debajo de 1024 px, el sistema DEBE desplazar únicamente la región de contenido. La barra superior y el cajón DEBEN quedar fuera de ese scroll, y el documento NO DEBE desplazarse ni rebotar.

#### Scenario: Scroll en cualquier pantalla

- **WHEN** la persona hace scroll en una pantalla privada con un viewport de 320 a 1023 px
- **THEN** solo se desplaza el contenido, la barra superior permanece en su posición y no se ve el fondo moviéndose por encima de ella

#### Scenario: Límites del scroll

- **WHEN** la persona llega al inicio o al final de una pantalla y sigue arrastrando
- **THEN** no hay rebote del documento ni aparece una franja de fondo sobre la barra o bajo el contenido

#### Scenario: Cambio de sección

- **WHEN** la persona navega a otra sección desde una pantalla estrecha
- **THEN** la nueva pantalla empieza arriba, la barra superior sigue visible y el cajón queda cerrado

#### Scenario: Escritorio intacto

- **WHEN** la persona abre la aplicación con 1024 px o más
- **THEN** el documento conserva su scroll, el panel lateral sigue fijo y el comportamiento actual no cambia

### Requirement: Altura útil del viewport

El sistema DEBE dimensionar la interfaz con la altura visible real del navegador y NO DEBE reservar espacio para barras de navegador que puedan estar ocultas. Las pantallas cortas DEBEN llenar esa altura sin generar una franja inferior vacía.

#### Scenario: Barra del navegador visible

- **WHEN** Safari o Chrome muestran su barra inferior
- **THEN** el contenido termina dentro del área visible y ningún control queda tapado por la barra

#### Scenario: Barra del navegador oculta

- **WHEN** la barra del navegador se oculta al hacer scroll
- **THEN** la interfaz se ajusta a la nueva altura sin dejar una franja inferior reservada

#### Scenario: Pantalla con poco contenido

- **WHEN** una pantalla tiene menos contenido que la altura disponible
- **THEN** ocupa el área visible completa sin añadir scroll vertical innecesario

### Requirement: Áreas seguras

La barra superior, el contenido, el cajón, los avisos y los modales DEBEN respetar el notch, los laterales y el indicador de inicio del dispositivo, de modo que ningún control quede bajo ellos.

#### Scenario: Dispositivo con notch e indicador

- **WHEN** la persona usa un dispositivo con áreas seguras
- **THEN** la barra y el contenido empiezan después del notch y terminan antes del indicador de inicio

#### Scenario: Aviso inferior

- **WHEN** aparece un aviso en la parte inferior de una pantalla estrecha
- **THEN** queda por encima del indicador de inicio y de la barra del navegador

### Requirement: Sin zoom al enfocar campos

En pantallas estrechas, enfocar cualquier campo editable NO DEBE cambiar la escala ni ampliar la página. El zoom manual con dos dedos DEBE seguir disponible.

#### Scenario: Búsqueda principal

- **WHEN** la persona enfoca el campo de búsqueda de una pantalla privada en un iPhone
- **THEN** la página mantiene su escala y el teclado aparece sin ampliar la interfaz

#### Scenario: Campo dentro de un modal

- **WHEN** la persona enfoca el buscador de emociones o el campo de etiquetas dentro de un modal
- **THEN** el modal conserva su escala y sigue siendo legible y operable

#### Scenario: Zoom manual

- **WHEN** la persona hace el gesto de pellizcar con dos dedos
- **THEN** el navegador sigue permitiendo ampliar y reducir la página

### Requirement: Modales estables con el teclado

Con el teclado abierto, un modal DEBE permanecer dentro del área visible, conservar su cuerpo desplazable y mantener accesibles el campo enfocado y la acción de cierre. El fondo NO DEBE desplazarse.

#### Scenario: Teclado abierto sobre un modal

- **WHEN** la persona enfoca un campo de un modal en una pantalla estrecha
- **THEN** el modal se ajusta al área visible, el campo enfocado sigue a la vista y el contenido del modal se puede recorrer

#### Scenario: Cierre con el teclado abierto

- **WHEN** la persona cierra el modal mientras el teclado está abierto
- **THEN** el fondo recupera su estado, sin quedar bloqueado ni desplazado

#### Scenario: Fondo inmóvil

- **WHEN** un modal está abierto y la persona intenta desplazar el contenido de detrás
- **THEN** el fondo no se mueve, también en Safari
