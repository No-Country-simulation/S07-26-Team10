"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { z } from "zod";
import { AUTH_LOGIN_PATH, parseApiErrorMessage } from "./auth-api";
import { getApiUrl } from "@/lib/api-url";
import { ActionResult, LoginCredentials, LoginTokenResponse } from "./auth-types";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Ingresa un correo electrónico válido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export async function loginAction(credentials: LoginCredentials): Promise<ActionResult> {
  const validation = loginSchema.safeParse(credentials);
  if (!validation.success) {
    const firstError = validation.error.issues[0]?.message || "Datos inválidos";
    return { ok: false, error: firstError };
  }

  const { email, password } = validation.data;
  let token: string | null = null;
  let errorMessage: string | null = null;

  try {
    const response = await fetch(getApiUrl(AUTH_LOGIN_PATH), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    if (response.ok) {
      const data = (await response.json()) as LoginTokenResponse;
      token = data.access_token;
    } else {
      const errorData = await response.json().catch(() => null);
      errorMessage = parseApiErrorMessage(errorData);
    }
  } catch (err) {
    console.error("Error al conectar con el servidor de autenticación:", err);
    errorMessage =
      "No se pudo conectar con el servidor. Verifica que la API esté en ejecución.";
  }

  if (!token || errorMessage) {
    return { ok: false, error: errorMessage || "No se pudo iniciar sesión." };
  }

  // Store token in HTTP-only cookie securely
  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  refresh();
  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  refresh();
  redirect("/login");
}
