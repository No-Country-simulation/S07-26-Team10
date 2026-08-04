import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { AUTH_ME_PATH } from "./auth-api";
import { getApiUrl } from "@/lib/api-url";
import { AuthUser, CurrentUserResponse } from "./auth-types";
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

  if (env.apiUrl) {
    try {
      const response = await fetch(getApiUrl(AUTH_ME_PATH), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (response.ok) {
        const user = (await response.json()) as CurrentUserResponse;

        if (!user.is_active) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: "admin",
        };
      }

      if (response.status === 401) {
        return null;
      }
    } catch (error) {
      console.error("Error fetching current user from API:", error);
    }

    return null;
  }

  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const payloadBase64 = parts[1];
      const normalizedBase64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = Buffer.from(normalizedBase64, "base64").toString("utf-8");
      const parsed = JSON.parse(jsonPayload);

      if (parsed.exp && parsed.exp * 1000 < Date.now()) {
        return null;
      }

      return {
        id: parsed.sub || parsed.id || "admin-1",
        email: parsed.email || "",
        name: parsed.name || "Usuario",
        role: parsed.role || "admin",
      };
    }

    return {
      id: "admin-1",
      email: "",
      name: "Usuario",
      role: "admin",
    };
  } catch (error) {
    console.error("Error parsing auth token:", error);
    return null;
  }
});
