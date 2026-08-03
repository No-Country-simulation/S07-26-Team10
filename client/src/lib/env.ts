import "server-only";

function sanitizeApiUrl(val: string | undefined): string {
  if (!val) return "";
  let trimmed = val.trim();
  if (!trimmed) return "";

  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `http://${trimmed}`;
  }

  try {
    const url = new URL(trimmed);
    return url.toString();
  } catch {
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

