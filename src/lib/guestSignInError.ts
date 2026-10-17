export function getGuestSignInErrorMessage(error: unknown): string {
  const code =
    error !== null && typeof error === "object" && "code" in error
      ? error.code
      : undefined;

  if (
    code === "auth/operation-not-allowed" ||
    code === "auth/admin-restricted-operation"
  ) {
    return "La prueba como invitado está desactivada en Firebase. Activa el acceso anónimo o crea una cuenta para empezar.";
  }

  return "No pudimos iniciar la prueba como invitado. Inténtalo de nuevo o crea una cuenta.";
}
