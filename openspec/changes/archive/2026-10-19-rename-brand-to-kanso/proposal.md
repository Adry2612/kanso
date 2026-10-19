# Renombrar la marca a Kanso

## Por qué

La aplicación se llama **Kanso** y su repositorio ya es `kanso.git`, pero el
código, los estilos y los textos siguen diciendo «Collectify»: 501 apariciones
en `src/`. Es una deuda que estorba en cada cambio —hay variables
`--collectify-*`, clases `collectify-*` y claves de almacenamiento
`collectify-*`— y que además está a medias: el paquete y el panel dicen «kanso»,
el resto no. Ahora entra un logotipo nuevo y conviene que toda la identidad sea
una sola cosa.

## Qué cambia

- **Marca visible.** La bienvenida pública, la pantalla de acceso y el panel
  lateral pasan a mostrar el logotipo y el nombre Kanso. El título y la
  descripción del documento también.
- **Identificadores internos.** Las 7 variables CSS `--collectify-*` y las 16
  clases `collectify-*` pasan a `--kanso-*` y `kanso-*`.
- **Preferencias guardadas.** Las claves `collectify-theme` y
  `collectify-sidebar-collapsed` pasan a `kanso-*`. Quien ya usaba la aplicación
  conserva su tema y el estado del panel: se lee una vez la clave anterior.
- **Iconos.** El logotipo pasa a ser el favicon y el icono de la aplicación.
- **Documentación.** `README.md`, `docs/TRADUCCIONES.md` y el comentario de
  `firestore.rules`.

## Qué NO cambia, a propósito

- **Identificadores de infraestructura.** El *project id* de Firebase
  (`collectify-2d503`), su dominio de autenticación, el bucket de Storage y el
  proyecto de Sentry son inmutables en el proveedor y no los ve nadie.
  Renombrarlos exigiría crear proyectos nuevos y migrar usuarios y datos: coste
  alto, beneficio visible nulo. Se quedan como están.
- **Registro histórico.** Las propuestas archivadas en
  `openspec/changes/archive/` no se reescriben: son el acta de lo que se decidió
  cuando la aplicación se llamaba Collectify.
- **Mockups sin uso.** `public/redesign.html` y
  `public/redesign-3-propuestas.html` no los referencia nadie.

## Capacidades afectadas

- `brand-identity` (nueva): el nombre, el logotipo y el icono de la aplicación.
- `appearance-settings` (modificada): los tokens del tema cambian de nombre y las
  preferencias guardadas migran.
