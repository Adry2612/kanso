# Spec Delta

## MODIFIED Requirements

### Requirement: Página de bienvenida pública

El sistema DEBE (MUST) mostrar una página de bienvenida pública en `/` con acceso a registro, inicio de sesión y prueba como invitado. La bienvenida DEBE mostrarse también cuando existe una sesión anónima guardada; solo una cuenta real con sesión activa DEBE continuar directamente a `/home`.

#### Scenario: Acceso desde la bienvenida

- **WHEN** una persona sin sesión abre `/`
- **THEN** el sistema muestra la bienvenida con accesos a crear cuenta, iniciar sesión y probar sin registrarse

#### Scenario: Sesión anónima guardada

- **WHEN** una persona con una sesión anónima de una visita anterior abre `/`
- **THEN** el sistema muestra la bienvenida y no la lleva directamente a la aplicación

#### Scenario: Acceso con sesión activa

- **WHEN** una persona con una cuenta no anónima activa abre `/`
- **THEN** el sistema dirige su acceso principal a `/home`

## ADDED Requirements

### Requirement: Entrada explícita como invitado

El sistema DEBE (MUST) distinguir una sesión anónima iniciada explícitamente en la visita actual de una sesión anónima restaurada. Si la persona abre una ruta privada con una sesión anónima restaurada que no inició en esta visita, DEBE llevarla a la bienvenida para que elija entre entrar como invitado o usar una cuenta. Una vez elegida la prueba como invitado, DEBE poder navegar por las rutas privadas con normalidad.

#### Scenario: Ruta privada con invitado restaurado

- **WHEN** una persona abre `/home` o cualquier otra ruta privada con una sesión anónima restaurada que no inició en esta visita
- **THEN** el sistema la lleva a la bienvenida en lugar de mostrarla dentro de la aplicación

#### Scenario: Entrada explícita como invitado

- **WHEN** la persona pulsa «Probar sin registrarme» en la bienvenida
- **THEN** el sistema reutiliza la sesión anónima existente o crea una, la lleva a `/home` y le permite navegar por las rutas privadas durante la visita

#### Scenario: Cuenta real en ruta privada

- **WHEN** una persona con una cuenta no anónima abre una ruta privada
- **THEN** el sistema le permite el acceso sin pasar por la bienvenida

#### Scenario: Nueva visita posterior

- **WHEN** la persona cierra el navegador y vuelve a abrir una ruta privada más tarde
- **THEN** la sesión anónima no se considera una entrada explícita de esta visita y vuelve a mostrarse la bienvenida

#### Scenario: Cierre de sesión de invitado

- **WHEN** la persona cierra la sesión de invitado desde ajustes
- **THEN** el sistema la devuelve a la bienvenida y no conserva el acceso directo a las rutas privadas
