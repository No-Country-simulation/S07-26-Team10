import "server-only";
import { z } from "zod";

const sanitizeEmpty = (val: unknown) =>
  typeof val === "string" && val.trim() === "" ? undefined : val;

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.preprocess(
    sanitizeEmpty,
    z.string().url("NEXT_PUBLIC_API_URL debe ser una URL válida").optional(),
  ),
});

function validateEnv() {
  const rawEnv = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  };

  const parsed = envSchema.safeParse(rawEnv);

  if (!parsed.success) {
    const errorMessages = parsed.error.issues
      .map((issue) => `Variable '${issue.path.join(".")}': ${issue.message}`)
      .join("\n");

    console.error(
      "[Config Error] Error de configuración en variables de entorno (.env):\n" +
        errorMessages,
    );

    throw new Error(
      `[Config Error] Faltan variables de entorno obligatorias o son inválidas en el archivo .env:\n${errorMessages}`,
    );
  }

  return {
    apiUrl: parsed.data.NEXT_PUBLIC_API_URL ?? "",
  };
}

export const env = validateEnv();
