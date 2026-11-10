# Spec Delta

## ADDED Requirements

### Requirement: Aplicación instalable sin chrome del navegador

El sistema DEBE (MUST) declararse como aplicación web instalable con el nombre Kanso, su logotipo como icono, un color de tema coherente y modo de visualización `standalone`, de forma que al abrirla desde el icono instalado no se muestren la barra de rutas ni los botones del navegador. El punto de entrada DEBE ser la bienvenida y la aplicación DEBE seguir funcionando con normalidad en una pestaña normal del navegador.

#### Scenario: Instalación desde el móvil

- **WHEN** la persona abre la aplicación en un navegador móvil compatible y elige añadirla a la pantalla de inicio
- **THEN** el sistema ofrece el nombre Kanso y su logotipo como icono de la aplicación

#### Scenario: Apertura desde el icono instalado

- **WHEN** la persona abre la aplicación desde el icono añadido a la pantalla de inicio
- **THEN** la interfaz ocupa la pantalla sin la barra de rutas ni los botones del navegador, respetando las áreas seguras del dispositivo

#### Scenario: Punto de entrada de la aplicación instalada

- **WHEN** la persona abre la aplicación instalada por primera vez
- **THEN** se muestra la bienvenida pública, no una pantalla privada sin contexto

#### Scenario: Pestaña normal

- **WHEN** la persona abre la aplicación en una pestaña normal del navegador
- **THEN** la aplicación funciona con normalidad y el navegador conserva su propia barra y botones, que la web no puede ocultar

#### Scenario: Icono en la pantalla de inicio

- **WHEN** la aplicación instalada aparece en la pantalla de inicio del dispositivo
- **THEN** su icono es el logotipo de Kanso y no un icono genérico o en blanco
