import "server-only";

function sanitizeApiUrl(val: string | undefined): string {
  if (!val) return "";
  // Limpia comillas circundantes (común en configuraciones de Vercel/env) y espacios
  let trimmed = val.trim().replace(/^["']|["']$/g, "").trim();
  if (!trimmed) return "";

  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  try {
    new URL(trimmed);
    return trimmed;
  } catch {
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    console.warn(
      `[Config Warning] NEXT_PUBLIC_API_URL no es una URL válida: "${val}". Se usará cadena vacía.`,
    );
    return "";
  }
}

function validateEnv() {
  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL;
  const apiUrl = sanitizeApiUrl(rawApiUrl);

  return {
    apiUrl,
  };
}

export const env = validateEnv();

