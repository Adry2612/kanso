# Spec Delta

## ADDED Requirements

### Requirement: Cuadrícula de la colección con tarjetas de tamaño estable

La cuadrícula de la colección DEBE (MUST) mantener un ancho de tarjeta estable de 300–320 px y repartir el número de columnas según el espacio disponible, sin encoger las tarjetas al ensanchar la ventana. En móvil DEBE conservar dos columnas. La vista de lista NO se ve afectada.

#### Scenario: Ventana de escritorio estándar

- **WHEN** la persona abre la colección en una ventana de 1440 px con la barra lateral abierta y varios álbumes
- **THEN** la cuadrícula muestra tres columnas con tarjetas de unos 316 px de ancho

#### Scenario: Ventana ultrawide

- **WHEN** la persona abre la colección en una ventana de 2400 px o más
- **THEN** la cuadrícula añade columnas suficientes para llenar el ancho disponible y las tarjetas conservan entre 300 y 320 px, sin desplazamiento horizontal

#### Scenario: Ventana móvil

- **WHEN** la persona abre la colección en una pantalla de 390 px
- **THEN** la cuadrícula mantiene dos columnas y no aparece desplazamiento horizontal

#### Scenario: Vista de lista

- **WHEN** la persona cambia la colección a la vista de lista
- **THEN** las filas conservan su presentación compacta y el tamaño de tarjeta no interviene
