"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  createReferenceSchema,
  updateReferenceSchema,
  type CreateReferenceInput,
  type UpdateReferenceInput,
  type ReferenceItem,
} from "../schemas/reference-schema";
import { getApiUrl } from "@/lib/api-url";

async function getAuthHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * GET /api/v1/references/report/{report_id}/admin
 * Listar todas las referencias de un reporte (admin)
 */
export async function getReferencesAction(reportId?: string): Promise<ReferenceItem[]> {
  if (!reportId) return [];

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl(`/references/report/${reportId}/admin`), {
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = (await res.json()) as ReferenceItem[];
      return data;
    }
    console.warn("getReferencesAction: API returned status", res.status);
  } catch (error) {
    console.error("Error fetching references from API:", error);
  }

  return [];
}

export async function getReferencesByReportAction(reportId: string): Promise<ReferenceItem[]> {
  return getReferencesAction(reportId);
}

/**
 * GET /api/v1/references/{reference_id}
 * Obtener referencia por ID
 */
export async function getReferenceByIdAction(referenceId: string): Promise<ReferenceItem | undefined> {
  if (!referenceId) return undefined;

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl(`/references/${referenceId}`), {
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = (await res.json()) as ReferenceItem;
      return data;
    }
    if (res.status === 404) {
      return undefined;
    }
    console.warn("getReferenceByIdAction: API returned status", res.status);
  } catch (error) {
    console.error("Error fetching reference by ID from API:", error);
  }

  return undefined;
}

/**
 * POST /api/v1/references/
 * Crear referencia asociada a un reporte
 */
export async function createReferenceAction(input: CreateReferenceInput): Promise<{
  success: boolean;
  data?: ReferenceItem;
  errors?: Record<string, string[]>;
  message?: string;
}> {
  const result = createReferenceSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "Por favor corrija los errores en el formulario.",
    };
  }

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl("/references/"), {
      method: "POST",
      headers,
      body: JSON.stringify({
        report_id: result.data.report_id,
        authors: result.data.authors,
        title: result.data.title,
        year: result.data.year,
        source: result.data.source,
        citation_url: result.data.citation_url || "",
      }),
    });

    if (res.status === 201 || res.ok) {
      const data = (await res.json()) as ReferenceItem;
      revalidatePath("/admin/references");
      return {
        success: true,
        data,
        message: "Referencia creada exitosamente.",
      };
    }

    if (res.status === 401) {
      return {
        success: false,
        message: "Sesión expirada o token inválido.",
      };
    }

    const errorBody = await res.json().catch(() => ({}));
    return {
      success: false,
      message: errorBody.detail?.[0]?.msg || errorBody.detail || "Error al crear la referencia.",
    };
  } catch (error) {
    console.error("Error creating reference via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la API.",
    };
  }
}

/**
 * PATCH /api/v1/references/{reference_id}
 * Actualizar referencia parcialmente
 */
export async function updateReferenceAction(
  referenceId: string,
  input: UpdateReferenceInput
): Promise<{
  success: boolean;
  data?: ReferenceItem;
  errors?: Record<string, string[]>;
  message?: string;
}> {
  const result = updateReferenceSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "Por favor corrija los errores en el formulario.",
    };
  }

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl(`/references/${referenceId}`), {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        authors: result.data.authors,
        title: result.data.title,
        year: result.data.year,
        source: result.data.source,
        citation_url: result.data.citation_url || "",
        display_order: result.data.display_order ?? 0,
      }),
    });

    if (res.ok) {
      const data = (await res.json()) as ReferenceItem;
      revalidatePath("/admin/references");
      return {
        success: true,
        data,
        message: "Referencia actualizada exitosamente.",
      };
    }

    if (res.status === 404) {
      return { success: false, message: "Referencia no encontrada." };
    }

    if (res.status === 401) {
      return { success: false, message: "Sesión expirada o token inválido." };
    }

    const errorBody = await res.json().catch(() => ({}));
    return {
      success: false,
      message: errorBody.detail?.[0]?.msg || errorBody.detail || "Error al actualizar la referencia.",
    };
  } catch (error) {
    console.error("Error updating reference via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la API.",
    };
  }
}

/**
 * DELETE /api/v1/references/{reference_id}
 * Eliminar una referencia
 */
export async function deleteReferenceAction(referenceId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl(`/references/${referenceId}`), {
      method: "DELETE",
      headers,
    });

    if (res.ok || res.status === 204) {
      revalidatePath("/admin/references");
      return { success: true, message: "Referencia eliminada exitosamente." };
    }

    const errorBody = await res.json().catch(() => ({}));
    return {
      success: false,
      message: errorBody.detail?.[0]?.msg || errorBody.detail || "Error al eliminar la referencia.",
    };
  } catch (error) {
    console.error("Error deleting reference via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la API.",
    };
  }
}
