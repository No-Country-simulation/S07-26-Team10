import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { AuthUser } from "./auth-types";
import { env } from "@/lib/env";

/**
 * Server-only query to retrieve the currently authenticated user from the session cookie.
 * Wrapped in React cache() for request-level deduplication.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  try {
    // Attempt parsing token if JWT payload format (header.payload.signature)
    const parts = token.split(".");
    if (parts.length === 3) {
      const payloadBase64 = parts[1];
      const normalizedBase64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = Buffer.from(normalizedBase64, "base64").toString("utf-8");
      const parsed = JSON.parse(jsonPayload);

      return {
        id: parsed.sub || parsed.id || "admin-1",
        email: parsed.email || env.adminEmail,
        name: parsed.name || "Administrador",
        role: parsed.role || "admin",
      };
    }

    // Fallback if token is simple string format
    return {
      id: "admin-1",
      email: env.adminEmail,
      name: "Administrador",
      role: "admin",
    };
  } catch (error) {
    console.error("Error parsing auth token:", error);
    return null;
  }
});
