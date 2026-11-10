# Spec Delta

## Purpose

Define un vocabulario cerrado y estable para las etiquetas personales de idioma y género, de modo que se guarden como claves canónicas, se muestren traducidas y coincidan siempre en filtros y recomendaciones.

## ADDED Requirements

### Requirement: Catálogo canónico de idiomas y géneros

El sistema DEBE (MUST) mantener un catálogo cerrado de idiomas identificados por código ISO 639-1 y de géneros identificados por las ramas canónicas de la aplicación, sin admitir valores escritos libremente.

#### Scenario: Idioma del catálogo

- **WHEN** la persona elige un idioma al guardar un álbum
- **THEN** solo puede elegir uno de los idiomas del catálogo o dejar el álbum sin idioma

#### Scenario: Género del catálogo

- **WHEN** la persona elige un género al guardar un álbum
- **THEN** solo puede elegir una de las ramas canónicas del catálogo o dejar el álbum sin género

#### Scenario: Valor fuera del catálogo

- **WHEN** una petición intenta guardar un idioma o un género que no pertenece al catálogo
- **THEN** el sistema lo descarta y conserva el resto de la petición

### Requirement: Un idioma y un género principal por álbum

Cada álbum DEBE (MUST) guardar como máximo un idioma y un género, ambos opcionales, sin duplicados ni valores equivalentes escritos de otra forma.

#### Scenario: Guardado con idioma y género

- **WHEN** la persona elige un idioma y un género
- **THEN** el sistema guarda una etiqueta de cada eje con su clave canónica

#### Scenario: Cambio de género

- **WHEN** la persona elige otro género para un álbum que ya tenía uno
- **THEN** el sistema sustituye el anterior en lugar de acumular dos

#### Scenario: Sin idioma

- **WHEN** la persona deja el idioma vacío, por ejemplo en un disco instrumental
- **THEN** el sistema guarda el álbum sin etiqueta de idioma

### Requirement: Etiquetas traducidas al mostrarse

El sistema DEBE (MUST) mostrar el nombre del idioma y del género en el idioma activo de la interfaz, aunque la clave guardada sea independiente del idioma.

#### Scenario: Interfaz en español

- **WHEN** la interfaz está en español y el álbum tiene `género: electronic`
- **THEN** la etiqueta se muestra como «Electrónica»

#### Scenario: Cambio de idioma de la interfaz

- **WHEN** la persona cambia la interfaz a inglés
- **THEN** la misma etiqueta se muestra como «Electronic» sin volver a guardar el álbum

#### Scenario: Etiqueta heredada

- **WHEN** el álbum conserva una etiqueta antigua escrita como «Electrónica» o «Electronica»
- **THEN** el sistema la reconoce y la muestra con la etiqueta traducida de su clave canónica

### Requirement: Compatibilidad con etiquetas existentes

El sistema DEBE (MUST) reconocer las variantes históricas de idioma y género —mayúsculas, acentos, nombres en español o inglés, categorías como `genero` o `genre`— y resolverlas a su clave canónica al leer y al migrar.

#### Scenario: Variante de género

- **WHEN** el sistema encuentra `Electrónica`, `electronica` o `Electronic` en categoría de género
- **THEN** las interpreta como la rama `electronic`

#### Scenario: Variante de idioma

- **WHEN** el sistema encuentra `Inglés`, `inglés` o `English` en categoría de idioma
- **THEN** las interpreta como el código `en`

#### Scenario: Variante de categoría

- **WHEN** el sistema encuentra la categoría `genero` o `genre`
- **THEN** la trata como `género`

### Requirement: Migración de etiquetas

El sistema DEBE (MUST) ofrecer una migración idempotente que reescriba las etiquetas existentes a claves canónicas, con modo de simulación, filtro por usuario e informe de valores no reconocidos, sin borrar los datos que no pueda interpretar.

#### Scenario: Simulación

- **WHEN** se ejecuta la migración con `--dry-run`
- **THEN** el sistema informa de los cambios que haría sin modificar ningún documento

#### Scenario: Migración completa

- **WHEN** se ejecuta la migración sobre una colección con etiquetas heredadas
- **THEN** las etiquetas reconocidas quedan con su clave canónica y sin duplicados

#### Scenario: Valor no reconocido

- **WHEN** una etiqueta no coincide con ningún alias del catálogo
- **THEN** el sistema la deja intacta y la incluye en el informe para revisión manual

#### Scenario: Segundo pase

- **WHEN** se ejecuta la migración dos veces seguidas
- **THEN** la segunda ejecución no cambia ningún documento
