# Spec Delta

## MODIFIED Requirements

### Requirement: Registro con correo y contraseña

El sistema DEBE permitir crear una cuenta proporcionando un nombre, un correo y una contraseña, y DEBE almacenar el nombre como nombre para mostrar.

#### Scenario: Registro correcto

- **WHEN** la persona envía el formulario de registro con un nombre, correo y contraseña válidos
- **THEN** el sistema crea la cuenta, guarda el nombre como nombre para mostrar y redirige a `/home`

#### Scenario: Nombre vacío

- **WHEN** la persona envía el registro sin nombre
- **THEN** el sistema muestra el mensaje "Escribe tu nombre para crear la cuenta." y no crea la cuenta

#### Scenario: Error de Firebase en el registro

- **WHEN** Firebase rechaza el registro (por ejemplo, correo ya en uso)
- **THEN** el sistema muestra un mensaje de error y permanece en la pantalla de registro

### Requirement: Inicio de sesión con Google

El sistema DEBE permitir iniciar sesión con una cuenta de Google mediante una ventana emergente.

#### Scenario: Inicio de sesión con Google correcto

- **WHEN** la persona completa el flujo emergente de Google
- **THEN** el sistema establece la sesión y la redirige a `/home`

#### Scenario: El usuario cancela la ventana de Google

- **WHEN** la persona cierra la ventana emergente de Google
- **THEN** el sistema trata la acción como una cancelación sin mostrar error

#### Scenario: Intentos de inicio simultáneos

- **WHEN** ya hay un inicio de sesión con Google en curso y se intenta otro
- **THEN** el sistema ignora el nuevo intento para evitar ventanas emergentes duplicadas

#### Scenario: Sin acceso de escritura a Firestore

- **WHEN** la persona inicia sesión con Google correctamente
- **THEN** el sistema no intenta escribir en Firestore desde el cliente y la sesión queda establecida aunque las reglas denieguen ese acceso
