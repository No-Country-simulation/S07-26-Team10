import "server-only";

/**
 * Construye la URL completa leyendo directamente process.env.NEXT_PUBLIC_API_URL en tiempo de ejecución.
 * Ejemplo: getApiUrl("/auth/login") → http://localhost:8000/api/v1/auth/login
 */
export function getApiUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

