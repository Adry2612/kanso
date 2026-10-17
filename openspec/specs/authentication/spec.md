# Autenticación

## Purpose

Permite a las personas registrarse, iniciar sesión con correo/contraseña o Google, y usar la aplicación como invitado mediante Firebase Authentication, conservando la sesión entre visitas.

## Requirements

### Requirement: Registro con correo y contraseña

El sistema DEBE permitir crear una cuenta proporcionando un nombre, un correo y una contraseña, almacenar el nombre como nombre para mostrar y registrar al usuario.

#### Scenario: Registro correcto

- **WHEN** la persona envía el formulario de registro con un nombre, correo y contraseña válidos
- **THEN** el sistema crea la cuenta, guarda el nombre como nombre para mostrar, registra el usuario bajo `users/{uid}` si no existe y redirige a `/home`

#### Scenario: Nombre vacío

- **WHEN** la persona envía el registro sin nombre
- **THEN** el sistema muestra el mensaje "Escribe tu nombre para crear la cuenta." y no crea la cuenta

#### Scenario: Error de Firebase en el registro

- **WHEN** Firebase rechaza el registro (por ejemplo, correo ya en uso)
- **THEN** el sistema muestra un mensaje de error y permanece en la pantalla de registro

### Requirement: Inicio de sesión con correo y contraseña

El sistema DEBE permitir iniciar sesión con un correo y una contraseña ya registrados.

#### Scenario: Inicio de sesión correcto

- **WHEN** la persona envía credenciales válidas en el modo inicio de sesión
- **THEN** el sistema la redirige a `/home`

#### Scenario: Credenciales inválidas

- **WHEN** la persona envía credenciales incorrectas
- **THEN** el sistema muestra un mensaje de error y permanece en la pantalla de inicio de sesión

### Requirement: Inicio de sesión con Google

El sistema DEBE permitir iniciar sesión con una cuenta de Google mediante una ventana emergente y crear el perfil en Firestore si no existe.

#### Scenario: Inicio de sesión con Google correcto

- **WHEN** la persona completa el flujo emergente de Google
- **THEN** el sistema registra al usuario bajo `users/{uid}` si no existe y la redirige a `/home`

#### Scenario: El usuario cancela la ventana de Google

- **WHEN** la persona cierra la ventana emergente de Google
- **THEN** el sistema trata la acción como una cancelación sin mostrar error

#### Scenario: Intentos de inicio simultáneos

- **WHEN** ya hay un inicio de sesión con Google en curso y se intenta otro
- **THEN** el sistema ignora el nuevo intento para evitar ventanas emergentes duplicadas

### Requirement: Acceso como invitado

El sistema DEBE permitir usar la aplicación sin registro mediante una sesión anónima de Firebase.

#### Scenario: Sesión de invitado nueva

- **WHEN** una persona sin sesión activa elige "Probar sin registrarme"
- **THEN** el sistema crea una sesión anónima y la redirige a `/home`

#### Scenario: Reutilización de sesión existente

- **WHEN** ya existe una sesión activa y se solicita el acceso como invitado
- **THEN** el sistema reutiliza el usuario actual sin crear uno nuevo

#### Scenario: Acceso anónimo deshabilitado

- **WHEN** Firebase rechaza la autenticación anónima por configuración
- **THEN** el sistema muestra un mensaje indicando que la prueba como invitado está desactivada y ofrece crear una cuenta

### Requirement: Restauración de la sesión

El sistema DEBE mantener y restaurar la sesión del usuario entre recargas de la página.

#### Scenario: Recarga con sesión activa

- **WHEN** la persona recarga la aplicación con una sesión de Firebase activa
- **THEN** el sistema restaura al usuario y deja de mostrar el estado de carga

#### Scenario: Estado de carga inicial

- **WHEN** la aplicación se inicia y todavía no se conoce el estado de autenticación
- **THEN** el sistema mantiene un estado de carga hasta recibir la respuesta de Firebase

### Requirement: Protección de rutas privadas

El sistema DEBE exigir una sesión para acceder a las rutas privadas de la aplicación.

#### Scenario: Acceso sin sesión

- **WHEN** una persona sin sesión intenta abrir una ruta privada como `/recommendation`
- **THEN** el sistema la redirige a `/login?mode=login`

### Requirement: Cierre de sesión

El sistema DEBE permitir cerrar la sesión activa desde la página de ajustes.

#### Scenario: Cierre de sesión correcto

- **WHEN** la persona pulsa "Cerrar sesión"
- **THEN** el sistema cierra la sesión de Firebase y la redirige a `/`

#### Scenario: Error al cerrar sesión

- **WHEN** el cierre de sesión falla
- **THEN** el sistema muestra un mensaje de error y mantiene la sesión
