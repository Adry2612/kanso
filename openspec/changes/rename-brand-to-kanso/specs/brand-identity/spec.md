# Spec Delta

## Purpose

Define la identidad de la aplicación —nombre, logotipo e icono— para que se
presente igual en la bienvenida pública, la pantalla de acceso y el panel
lateral, y para que el icono del navegador sea el mismo logotipo.

## ADDED Requirements

### Requirement: Identidad y logotipo

El sistema DEBE presentarse como **Kanso**, acompañando el nombre con el
logotipo de la aplicación, en la bienvenida pública, la pantalla de acceso y el
panel lateral.

#### Scenario: Identidad en las tres cabeceras

- **WHEN** la persona abre la bienvenida, la pantalla de acceso o el panel lateral
- **THEN** ve el logotipo de Kanso junto al nombre y ningún texto que diga «Collectify»

#### Scenario: Logotipo con texto alternativo

- **WHEN** el logotipo se muestra junto al nombre
- **THEN** o bien se marca como decorativo, o bien su texto alternativo nombra Kanso, sin repetir el nombre dos veces seguidas

### Requirement: Icono de la aplicación

El sistema DEBE usar el logotipo de Kanso como icono de la pestaña del navegador
y como icono de aplicación para los accesos directos en pantallas de inicio.

#### Scenario: Icono de la pestaña

- **WHEN** la persona abre la aplicación en el navegador
- **THEN** la pestaña muestra el logotipo de Kanso y no el icono por defecto

#### Scenario: Título del documento

- **WHEN** la aplicación se carga
- **THEN** el título del documento es «Kanso»
