# Spec Delta

## MODIFIED Requirements

### Requirement: Catálogo de emociones

El sistema DEBE ofrecer un catálogo de 15 emociones con etiqueta, emoji y símbolo, DEBE normalizar sinónimos y variantes a una clave canónica, y DEBE mostrarlas todas a la vez en el selector —**sin paginar ni usar un carrusel**— agrupadas en familias con una etiqueta corta, con su emoji y una etiqueta legible en el tema activo. Cada emoción DEBE pertenecer a una única familia.

#### Scenario: Emociones disponibles

- **WHEN** la persona abre el selector de emociones
- **THEN** el sistema muestra las 15 emociones del catálogo, todas visibles a la vez y agrupadas por familias, sin flechas, rueda ni paginación

#### Scenario: Normalización de sinónimos

- **WHEN** llega una emoción como texto libre o en otro idioma
- **THEN** el sistema la resuelve a su clave canónica o la descarta si no la reconoce

## ADDED Requirements

### Requirement: Un único selector coherente

El sistema DEBE presentar las emociones y las actividades con el mismo selector —un mismo aspecto y las mismas marcas— en la pantalla de inicio, en el filtro de la colección y en el modal de guardar álbum. El selector DEBE trabajar con las claves canónicas y DEBE distinguir el estado elegido del no elegido sin depender únicamente del color.

#### Scenario: Mismo aspecto en toda la aplicación

- **WHEN** la persona ve el selector de emociones en el inicio, en el filtro o al guardar un álbum
- **THEN** reconoce el mismo control, con las emociones agrupadas igual en los tres sitios

#### Scenario: Elegir y alternar

- **WHEN** la persona pulsa una emoción
- **THEN** el sistema la marca como elegida de forma perceptible, y al volver a pulsarla la quita

#### Scenario: Etiquetas legibles

- **WHEN** el sistema muestra una emoción ya seleccionada
- **THEN** la muestra con su etiqueta traducida, nunca con su clave interna
