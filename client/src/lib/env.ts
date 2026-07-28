import "server-only";
import { z } from "zod";

const sanitizeEmpty = (val: unknown) =>
  typeof val === "string" && val.trim() === "" ? undefined : val;

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.preprocess(
    sanitizeEmpty,
    z.string().url("NEXT_PUBLIC_API_URL debe ser una URL válida").optional(),
  ),
  ADMIN_EMAIL: z.preprocess(
    sanitizeEmpty,
    z
      .string({
        message: "La variable ADMIN_EMAIL es requerida en .env",
      })
      .min(1, "ADMIN_EMAIL no puede estar vacía"),
  ),
  ADMIN_PASSWORD: z.preprocess(
    sanitizeEmpty,
    z
      .string({
        message: "La variable ADMIN_PASSWORD es requerida en .env",
      })
      .min(1, "ADMIN_PASSWORD no puede estar vacía"),
  ),
  JWT_SECRET: z.preprocess(
    sanitizeEmpty,
    z
      .string({ message: "La variable JWT_SECRET es requerida en .env" })
      .min(1, "JWT_SECRET no puede estar vacía"),
  ),
});

function validateEnv() {
  const rawEnv = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    JWT_SECRET: process.env.JWT_SECRET,
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
    adminEmail: parsed.data.ADMIN_EMAIL,
    adminPassword: parsed.data.ADMIN_PASSWORD,
    jwtSecret: parsed.data.JWT_SECRET,
  };
}

export const env = validateEnv();
