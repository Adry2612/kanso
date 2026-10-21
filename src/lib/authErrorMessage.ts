type AuthErrorLike = {
  code?: unknown;
};

function getCode(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const code = (error as AuthErrorLike).code;
  return typeof code === "string" ? code : null;
}

/**
 * Traduce los errores de Firebase Auth a mensajes que se puedan enseñar sin
 * filtrar códigos internos (`auth/invalid-credential`, etc.).
 */
export function getAuthErrorMessage(error: unknown, fallback: string): string {
  const code = getCode(error);

  switch (code) {
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "El correo o la contraseña no son correctos.";
    case "auth/invalid-email":
      return "Escribe un correo electrónico válido.";
    case "auth/missing-password":
      return "Escribe tu contraseña.";
    case "auth/email-already-in-use":
      return "Ya existe una cuenta con ese correo. Inicia sesión en lugar de crear otra.";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres.";
    case "auth/too-many-requests":
      return "Demasiados intentos seguidos. Espera un momento e inténtalo de nuevo.";
    case "auth/network-request-failed":
      return "No pudimos conectar con el servicio de acceso. Revisa tu conexión.";
    case "auth/user-disabled":
      return "Esta cuenta está desactivada.";
    case "auth/account-exists-with-different-credential":
      return "Ya existe una cuenta con este correo usando otro método de acceso. Entra con ese método.";
    case "auth/operation-not-allowed":
      return "Este método de acceso no está disponible ahora mismo. Prueba con otro.";
    case "auth/unauthorized-domain":
      return "Este dominio no está autorizado para iniciar sesión.";
    case "auth/popup-blocked":
      return "El navegador bloqueó la ventana de acceso. Permite las ventanas emergentes e inténtalo de nuevo.";
    case "auth/web-storage-unsupported":
      return "El navegador no permite guardar la sesión. Prueba con otro navegador o desactiva el modo privado.";
    case "auth/configuration-not-found":
    case "auth/invalid-api-key":
      return "La autenticación no está configurada correctamente. Inténtalo más tarde.";
    case "auth/internal-error":
      return "El servicio de acceso no respondió. Inténtalo de nuevo.";
    default:
      return fallback;
  }
}
