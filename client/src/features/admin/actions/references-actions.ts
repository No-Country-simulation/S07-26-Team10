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
import { getAllReportVersionsAction } from "./reports-actions";

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
 * GET /api/v1/report-versions/{report_version_id}/references/admin
 * Listar todas las referencias de un reporte (admin)
 */
export async function getReferencesAction(reportVersionId?: string): Promise<ReferenceItem[]> {
  if (!reportVersionId) return [];

  try {
    const headers = await getAuthHeaders();
    const urlsToTry = [
      `/report-versions/${reportVersionId}/references/admin`,
      `/report-versions/${reportVersionId}/references`,
      `/references/report/${reportVersionId}/admin`,
      `/references/`,
    ];

    for (const url of urlsToTry) {
      const res = await fetch(getApiUrl(url), {
        headers,
        cache: "no-store",
      });

      if (res.ok) {
        const data = (await res.json()) as ReferenceItem[];
        return data;
      }
    }
  } catch (error) {
    console.error("Error fetching references from API:", error);
  }

  return [];
}

export async function getReferencesByReportAction(reportVersionId: string): Promise<ReferenceItem[]> {
  return getReferencesAction(reportVersionId);
}

export async function getReferenceByIdAction(referenceId: string, reportVersionId?: string): Promise<ReferenceItem | undefined> {
  if (!referenceId) return undefined;

  try {
    const headers = await getAuthHeaders();

    if (reportVersionId) {
      const urlsToTry = [
        `/report-versions/${reportVersionId}/references/admin/${referenceId}`,
        `/report-versions/${reportVersionId}/references/${referenceId}`,
        `/references/${referenceId}`,
      ];

      for (const url of urlsToTry) {
        const res = await fetch(getApiUrl(url), {
          headers,
          cache: "no-store",
        });

        if (res.ok) {
          const data = (await res.json()) as ReferenceItem;
          return data;
        }
      }
    }

    const reportVersions = await getAllReportVersionsAction();
    for (const rv of reportVersions) {
      const urlsToTry = [
        `/report-versions/${rv.id}/references/admin/${referenceId}`,
        `/report-versions/${rv.id}/references/${referenceId}`,
      ];

      for (const url of urlsToTry) {
        const res = await fetch(getApiUrl(url), {
          headers,
          cache: "no-store",
        });

        if (res.ok) {
          const data = (await res.json()) as ReferenceItem;
          return data;
        }
      }
    }

    const res = await fetch(getApiUrl(`/references/${referenceId}`), {
      headers,
      cache: "no-store",
    });
    if (res.ok) {
      const data = (await res.json()) as ReferenceItem;
      return data;
    }
  } catch (error) {
    console.error("Error fetching reference by ID from API:", error);
  }

  return undefined;
}

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
    const reportVersionId = result.data.report_version_id || result.data.report_id;
    if (!reportVersionId) {
      return { success: false, message: "ID de versión de reporte no proporcionado." };
    }

    const payload: Record<string, unknown> = {
      authors: result.data.authors,
      title: result.data.title,
      year: result.data.year,
      source: result.data.source,
      citation_url: result.data.citation_url || "",
    };
    if (result.data.display_order !== undefined) {
      payload.display_order = result.data.display_order;
    }

    const urlsToTry = [
      `/report-versions/${reportVersionId}/references`,
      `/references/`,
    ];

    let lastRes: Response | null = null;
    for (const url of urlsToTry) {
      const res = await fetch(getApiUrl(url), {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
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
      lastRes = res;
    }

    if (lastRes?.status === 401) {
      return { success: false, message: "Sesión expirada o token inválido." };
    }

    const errorBody = lastRes ? await lastRes.json().catch(() => ({})) : {};
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

export async function updateReferenceAction(
  referenceId: string,
  input: UpdateReferenceInput,
  reportVersionId?: string
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
    const targetVersionId = reportVersionId || result.data.report_version_id || result.data.report_id;

    const payload: Record<string, unknown> = {};
    if (result.data.authors !== undefined) payload.authors = result.data.authors;
    if (result.data.title !== undefined) payload.title = result.data.title;
    if (result.data.year !== undefined) payload.year = result.data.year;
    if (result.data.source !== undefined) payload.source = result.data.source;
    if (result.data.citation_url !== undefined) payload.citation_url = result.data.citation_url;
    if (result.data.display_order !== undefined) payload.display_order = result.data.display_order;

    const urlsToTry = targetVersionId
      ? [
          `/report-versions/${targetVersionId}/references/${referenceId}`,
          `/references/${referenceId}`,
        ]
      : [`/references/${referenceId}`];

    let lastRes: Response | null = null;
    for (const url of urlsToTry) {
      const res = await fetch(getApiUrl(url), {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload),
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
      lastRes = res;
    }

    if (lastRes?.status === 404) {
      return { success: false, message: "Referencia no encontrada." };
    }

    if (lastRes?.status === 401) {
      return { success: false, message: "Sesión expirada o token inválido." };
    }

    const errorBody = lastRes ? await lastRes.json().catch(() => ({})) : {};
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

export async function deleteReferenceAction(
  referenceId: string,
  reportVersionId?: string
): Promise<{ success: boolean; message?: string }> {
  if (!referenceId) return { success: false, message: "ID de referencia no válido." };

  try {
    let targetVersionId = reportVersionId;

    if (!targetVersionId) {
      const refItem = await getReferenceByIdAction(referenceId, reportVersionId);
      if (refItem?.report_version_id || refItem?.report_id) {
        targetVersionId = refItem.report_version_id || refItem.report_id;
      }
    }

    const headers = await getAuthHeaders();
    const urlsToTry: string[] = [];

    if (targetVersionId) {
      urlsToTry.push(`/report-versions/${targetVersionId}/references/${referenceId}`);
    } else {
      const reportVersions = await getAllReportVersionsAction();
      for (const rv of reportVersions) {
        if (rv.id) {
          urlsToTry.push(`/report-versions/${rv.id}/references/${referenceId}`);
        }
      }
    }
    urlsToTry.push(`/references/${referenceId}`);

    let deletedFromDb = false;
    let lastRes: Response | null = null;
    let lastErrorMsg = "";

    for (const url of urlsToTry) {
      try {
        const res = await fetch(getApiUrl(url), {
          method: "DELETE",
          headers,
        });

        if (res.ok || res.status === 204) {
          deletedFromDb = true;
          break;
        }
        lastRes = res;
        const errJson = await res.json().catch(() => ({}));
        lastErrorMsg = errJson.detail?.[0]?.msg || errJson.detail || errJson.message || "";
      } catch (err) {
        console.warn(`Fetch delete failed for ${url}:`, err);
      }
    }

    if (deletedFromDb || lastRes?.status === 404) {
      revalidatePath("/admin/references");
      return {
        success: true,
        message: deletedFromDb
          ? "Referencia eliminada exitosamente."
          : "La referencia ya no existía en el servidor y ha sido removida.",
      };
    }

    if (lastRes?.status === 401) {
      return { success: false, message: "Sesión expirada o token inválido." };
    }

    return {
      success: false,
      message: lastErrorMsg || (lastRes ? `Error ${lastRes.status}: No se pudo eliminar la referencia.` : "Error al eliminar la referencia."),
    };
  } catch (error) {
    console.error("Error deleting reference via API:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "No se pudo conectar con el servidor de la API.",
    };
  }
}

