import "server-only";

export const AUTH_LOGIN_PATH = "/auth/login";
export const AUTH_ME_PATH = "/auth/me";

export function parseApiErrorMessage(errorData: unknown): string {
  if (!errorData || typeof errorData !== "object") {
    return "Credenciales inválidas. Revisa tu correo y contraseña.";
  }

  const data = errorData as Record<string, unknown>;

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (Array.isArray(data.details) && data.details.length > 0) {
    const firstDetail = data.details[0];

    if (
      firstDetail &&
      typeof firstDetail === "object" &&
      "message" in firstDetail &&
      typeof firstDetail.message === "string"
    ) {
      return firstDetail.message;
    }
  }

  return "Credenciales inválidas. Revisa tu correo y contraseña.";
}
