import "server-only";

import { env } from "@/lib/env";

/**
 * Construye la URL completa a partir de NEXT_PUBLIC_API_URL (termina en /api/v1/).
 * Ejemplo: getApiUrl("/auth/login") → http://localhost:8000/api/v1/auth/login
 */
export function getApiUrl(path: string): string {
  const base = env.apiUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
