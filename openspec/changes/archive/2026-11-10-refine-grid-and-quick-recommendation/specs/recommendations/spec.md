# Spec Delta

## MODIFIED Requirements

### Requirement: Historial de recomendaciones

El sistema DEBE (MUST) mostrar el historial de recomendaciones agrupado por fecha, con la portada, el nombre, los artistas, la hora, las emociones y un enlace a Spotify. En la vista de cuadrícula, las tarjetas DEBEN (MUST) mantener un ancho estable de 300–320 px y repartir las columnas según el espacio, sin encogerse al ensanchar la ventana; en móvil DEBE (MUST) conservar dos columnas.

#### Scenario: Historial con entradas

- **WHEN** el usuario abre su historial y tiene recomendaciones previas
- **THEN** el sistema las agrupa por fecha y muestra sus datos con acceso a Spotify

#### Scenario: Historial vacío

- **WHEN** el usuario no tiene recomendaciones previas
- **THEN** el sistema muestra el estado vacío del historial

#### Scenario: Historial en ventana ancha

- **WHEN** el usuario abre el historial en una ventana de 2400 px o más con entradas suficientes
- **THEN** la cuadrícula añade columnas para llenar el ancho y las tarjetas conservan entre 300 y 320 px, sin desplazamiento horizontal
