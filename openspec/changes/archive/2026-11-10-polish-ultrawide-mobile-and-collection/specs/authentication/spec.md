# Spec Delta

## MODIFIED Requirements

### Requirement: Inicio de sesión con Google

El sistema DEBE (MUST) permitir iniciar sesión con una cuenta de Google. En escritorio DEBE usar una ventana emergente y, en pantallas estrechas, DEBE usar el flujo de redirección del navegador para abrir el selector de cuenta y completar la sesión al volver a la aplicación. El sistema DEBE evitar ventanas o redirecciones duplicadas, NO DEBE crear ni reutilizar una sesión de invitado al iniciar sesión con Google y NO DEBE escribir en Firestore desde el cliente.

#### Scenario: Inicio de sesión con Google correcto

- **WHEN** la persona completa el flujo emergente de Google en una pantalla ancha
- **THEN** el sistema establece la sesión y la redirige a `/home` o al destino solicitado

#### Scenario: Inicio de sesión con Google en pantalla estrecha

- **WHEN** la persona pulsa «Continuar con Google» en un dispositivo móvil
- **THEN** el navegador abre el selector de cuenta de Google mediante redirección y, al elegir una cuenta, vuelve a la aplicación con la sesión establecida y la redirige al destino

#### Scenario: Sin cuenta elegida en móvil

- **WHEN** la persona vuelve de la redirección de Google sin haber elegido una cuenta
- **THEN** el sistema no inicia sesión, no crea ni reutiliza una sesión anónima y permanece en la pantalla de acceso mostrando un mensaje si hubo un error

#### Scenario: El usuario cancela la ventana de Google

- **WHEN** la persona cierra la ventana emergente de Google o vuelve atrás desde la redirección
- **THEN** el sistema trata la acción como una cancelación sin mostrar error y sin dejar una sesión iniciada

#### Scenario: Intentos de inicio simultáneos

- **WHEN** ya hay un inicio de sesión con Google en curso y se intenta otro
- **THEN** el sistema ignora el nuevo intento para evitar ventanas o redirecciones duplicadas

#### Scenario: Sin acceso de escritura a Firestore

- **WHEN** la persona inicia sesión con Google correctamente
- **THEN** el sistema no intenta escribir en Firestore desde el cliente y la sesión queda establecida aunque las reglas denieguen ese acceso
