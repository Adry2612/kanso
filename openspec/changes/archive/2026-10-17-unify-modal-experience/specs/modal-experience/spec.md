# Spec Delta

## Purpose

Define cómo se presentan los modales de la aplicación para que todos compartan un mismo lenguaje visual y una jerarquía de acciones predecible, respetando la identidad y el tema activos.

## ADDED Requirements

### Requirement: Shell visual único de los modales

El sistema DEBE presentar todos sus modales con un mismo shell visual: misma superficie y material, misma escala de radios, misma tipografía de título y un mismo botón de cierre, además de una estructura común de cabecera, cuerpo y acciones.

#### Scenario: Modal estándar

- **WHEN** la persona abre cualquier modal (ordenar, filtrar, guardar o editar un álbum, confirmación de éxito, álbum ya en la colección)
- **THEN** el modal usa el mismo shell visual que el resto

#### Scenario: Modal con cabecera de imagen

- **WHEN** un modal muestra una cabecera con imagen (hero)
- **THEN** el resto de su estructura (cuerpo, acciones y cierre) sigue el mismo shell que los modales sin hero

#### Scenario: Tema activo

- **WHEN** el tema es claro u oscuro
- **THEN** todos los modales usan las superficies y contrastes del tema activo

### Requirement: Jerarquía de acciones consistente

El sistema DEBE aplicar el mismo tratamiento visual a las acciones primaria, secundaria y destructiva en todos los modales.

#### Scenario: Acción primaria

- **WHEN** un modal ofrece una acción principal
- **THEN** usa el mismo estilo de acción primaria que el resto de modales

#### Scenario: Acción destructiva

- **WHEN** un modal ofrece una acción destructiva (por ejemplo, eliminar de la colección)
- **THEN** usa el mismo estilo de acción destructiva que el resto de modales, sin confundirse con la primaria
