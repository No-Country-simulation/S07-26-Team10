"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { z } from "zod";
import { ActionResult, LoginCredentials } from "./auth-types";
import { env } from "@/lib/env";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Ingresa un correo electrónico válido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

/**
 * Creates a mock JWT token string for fallback authentication
 */
function createMockJwtToken(email: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      sub: "admin-1",
      email,
      name: "Administrador PhysaFlow",
      role: "admin",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
    })
  ).toString("base64url");
  const signature = Buffer.from(env.jwtSecret).toString("base64url");
  return `${header}.${payload}.${signature}`;
}

export async function loginAction(credentials: LoginCredentials): Promise<ActionResult> {
  const validation = loginSchema.safeParse(credentials);
  if (!validation.success) {
    const firstError = validation.error.issues[0]?.message || "Datos inválidos";
    return { ok: false, error: firstError };
  }

  const { email, password } = validation.data;
  let token: string | null = null;
  let errorMessage: string | null = null;

  if (env.apiUrl) {
    try {
      const response = await fetch(`${env.apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        token = data.token || data.accessToken || data.jwt || data.data?.token;
      } else {
        const errorData = await response.json().catch(() => null);
        errorMessage =
          errorData?.message ||
          errorData?.error ||
          "Credenciales inválidas. Revisa tu correo y contraseña.";
      }
    } catch (err) {
      console.warn("API Server not reachable, attempting fallback validation", err);
    }
  }

  // Fallback environment credentials validation if API URL is not set or server couldn't be reached
  if (!token) {
    if (email === env.adminEmail && password === env.adminPassword) {
      token = createMockJwtToken(email);
      errorMessage = null;
    } else if (!errorMessage) {
      errorMessage = "Credenciales inválidas. Por favor verifica tu correo y contraseña.";
    }
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
