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

El sistema DEBE permitir cambiar el idioma de la interfaz sin recargar la página.

#### Scenario: Cambio a inglés

- **WHEN** la persona selecciona "EN"
- **THEN** el sistema actualiza los textos traducidos al inglés de inmediato

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
