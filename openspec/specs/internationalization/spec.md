# Internacionalización

## Purpose

Permite usar la interfaz en español o inglés, aplicando los cambios de idioma al instante y recordando la preferencia de la persona entre visitas.

## Requirements

### Requirement: Idiomas soportados

El sistema DEBE soportar español e inglés, con español como idioma por defecto.

#### Scenario: Idioma por defecto

- **WHEN** una persona sin preferencia guardada abre la aplicación
- **THEN** el sistema muestra la interfaz en español

### Requirement: Cambio de idioma

El sistema DEBE ofrecer en Ajustes un selector de idioma (Español / English) y, al cambiarlo, DEBE actualizar de inmediato todos los textos traducidos de la interfaz, incluida la propia página de Ajustes.

#### Scenario: Cambio a inglés

- **WHEN** la persona elige "English" en el selector de idioma de Ajustes
- **THEN** el sistema actualiza al inglés los textos traducidos de toda la interfaz, incluidos los de Ajustes, sin recargar la página

#### Scenario: Cambio a español

- **WHEN** la persona elige "Español" tras haber elegido inglés
- **THEN** la interfaz vuelve a mostrarse en español

### Requirement: Persistencia de la preferencia

El sistema DEBE recordar el idioma elegido entre visitas.

#### Scenario: Preferencia guardada

- **WHEN** la persona vuelve a abrir la aplicación después de elegir un idioma
- **THEN** el sistema aplica el idioma guardado, ignorando valores no soportados

### Requirement: Resolución de traducciones

El sistema DEBE resolver claves de traducción con espacios de nombres y claves anidadas, devolviendo la clave si no encuentra traducción.

#### Scenario: Clave anidada

- **WHEN** se solicita una clave con notación anidada
- **THEN** el sistema devuelve el valor correspondiente del idioma activo

#### Scenario: Clave inexistente

- **WHEN** se solicita una clave que no existe en el idioma activo
- **THEN** el sistema devuelve la propia clave como texto

### Requirement: Idioma del documento

El sistema DEBE aplicar el idioma activo al atributo `lang` del documento, de modo que coincida con la interfaz mostrada.

#### Scenario: Atributo lang del documento

- **WHEN** la persona cambia el idioma de la interfaz
- **THEN** el atributo `lang` del documento pasa a reflejar el idioma activo
