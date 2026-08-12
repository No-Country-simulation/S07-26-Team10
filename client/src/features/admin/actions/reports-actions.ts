"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  type BaseReport,
  type ReportVersion,
  type ReportWithVersions,
  type CreateReportVersionInput,
  type UpdateReportVersionInput,
  createReportVersionSchema,
  updateReportVersionSchema,
} from "../schemas/report-schema";
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

function parseApiError(errorBody: Record<string, unknown> | null | undefined, defaultMessage: string): { message: string; errors?: Record<string, string[]> } {
  if (!errorBody) return { message: defaultMessage };

  if (typeof errorBody.detail === "string") {
    return { message: errorBody.detail };
  }

  if (Array.isArray(errorBody.detail)) {
    const fieldErrors: Record<string, string[]> = {};
    const messages: string[] = [];

    errorBody.detail.forEach((err: unknown) => {
      if (typeof err === "string") {
        messages.push(err);
      } else if (err && typeof err === "object") {
        const errObj = err as Record<string, unknown>;
        const fieldName = Array.isArray(errObj.loc) ? String(errObj.loc[errObj.loc.length - 1]) : "general";
        const msg = String(errObj.msg || JSON.stringify(errObj));
        if (!fieldErrors[fieldName]) fieldErrors[fieldName] = [];
        fieldErrors[fieldName].push(msg);
        messages.push(`${fieldName}: ${msg}`);
      }
    });

    return {
      message: messages.length > 0 ? messages.join(" | ") : defaultMessage,
      errors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
    };
  }

  if (typeof errorBody.message === "string") {
    return { message: errorBody.message };
  }

  const jsonMsg = JSON.stringify(errorBody.detail || errorBody);
  return { message: jsonMsg && jsonMsg !== "{}" ? jsonMsg : defaultMessage };
}


// ==========================================
// BASE REPORTS ENDPOINTS (/api/v1/reports)
// ==========================================

/**
 * GET /api/v1/reports
 * Obtiene todos los reportes base con paginación. (Acceso público)
 */
export async function getReportsAction(skip: number = 0, limit: number = 100): Promise<BaseReport[]> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl(`/reports?skip=${skip}&limit=${limit}`), {
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = (await res.json()) as BaseReport[];
      return data;
    }
    console.warn("getReportsAction: API returned status", res.status);
  } catch (error) {
    console.error("Error fetching reports from API:", error);
  }

  return [];
}

/**
 * GET /api/v1/reports/admin/with-versions
 * Obtiene todos los reportes con todas sus versiones en una sola request. (Requiere autenticación)
 * Reemplaza el patrón N+1 de getReportsAction + getReportVersionsAction por cada reporte.
 */
export async function getReportsWithVersionsAction(
  skip: number = 0,
  limit: number = 100,
): Promise<ReportWithVersions[]> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(
      getApiUrl(`/reports/admin/with-versions?skip=${skip}&limit=${limit}`),
      { headers, cache: "no-store" },
    );

    if (res.ok) {
      const data = (await res.json()) as ReportWithVersions[];
      return data;
    }
    console.warn("getReportsWithVersionsAction: API returned status", res.status);
  } catch (error) {
    console.error("Error fetching reports with versions from API:", error);
  }

  return [];
}

/**
 * GET /api/v1/reports/by-slug/{slug}
 * Obtiene un reporte específico por su slug. (Acceso público)
 */
export async function getReportBySlugAction(slug: string): Promise<BaseReport | undefined> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl(`/reports/by-slug/${slug}`), {
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = (await res.json()) as BaseReport;
      return data;
    }
    if (res.status === 404) {
      return undefined;
    }
    console.warn("getReportBySlugAction: API returned status", res.status);
  } catch (error) {
    console.error("Error fetching report by slug from API:", error);
  }

  return undefined;
}

/**
 * POST /api/v1/reports
 * Crea un nuevo reporte. El slug se genera automáticamente. (Requiere autenticación)
 */
export async function createReportAction(): Promise<{
  success: boolean;
  data?: BaseReport;
  message?: string;
}> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl("/reports"), {
      method: "POST",
      headers,
      body: JSON.stringify({}),
    });


    if (res.status === 201 || res.ok) {
      const data = (await res.json()) as BaseReport;
      revalidatePath("/admin/reports");
      return {
        success: true,
        data,
        message: "Reporte base creado exitosamente.",
      };
    }

    if (res.status === 401) {
      return { success: false, message: "Sesión expirada o token inválido." };
    }

    const errorBody = await res.json().catch(() => ({}));
    const parsedErr = parseApiError(errorBody, "Error al crear el reporte base.");
    return {
      success: false,
      message: parsedErr.message,
    };
  } catch (error) {
    console.error("Error creating base report via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la API.",
    };
  }
}

/**
 * DELETE /api/v1/reports/{report_id}
 * Elimina un reporte y TODAS sus versiones en cascada. (Requiere autenticación)
 */
export async function deleteReportAction(reportId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl(`/reports/${reportId}`), {
      method: "DELETE",
      headers,
    });

    if (res.ok || res.status === 204) {
      revalidatePath("/admin/reports");
      return { success: true, message: "Reporte eliminado en cascada exitosamente." };
    }

    const errorBody = await res.json().catch(() => ({}));
    return {
      success: false,
      message: errorBody.detail?.[0]?.msg || errorBody.detail || "Error al eliminar el reporte.",
    };
  } catch (error) {
    console.error("Error deleting report via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la API.",
    };
  }
}

// ===================================================
// REPORT VERSIONS ENDPOINTS (/api/v1/reports/{id}/versions)
// ===================================================

/**
 * GET /api/v1/reports/{report_id}/versions
 * Listar versiones de un reporte específico. (Acceso público)
 */
export async function getReportVersionsAction(
  reportId: string,
  status?: "DRAFT" | "PUBLISHED"
): Promise<ReportVersion[]> {
  if (!reportId) return [];

  try {
    const headers = await getAuthHeaders();
    const url = status
      ? getApiUrl(`/reports/${reportId}/versions?status=${status}`)
      : getApiUrl(`/reports/${reportId}/versions`);

    const res = await fetch(url, {
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = (await res.json()) as ReportVersion[];
      return data;
    }
    console.warn("getReportVersionsAction: API returned status", res.status);
  } catch (error) {
    console.error("Error fetching report versions from API:", error);
  }

  return [];
}

/**
 * POST /api/v1/reports/{report_id}/versions
 * Crea una nueva versión para un reporte existente. (Requiere autenticación)
 */
export async function createReportVersionAction(
  reportId: string,
  input: CreateReportVersionInput
): Promise<{
  success: boolean;
  data?: ReportVersion;
  errors?: Record<string, string[]>;
  message?: string;
}> {
  const result = createReportVersionSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "Por favor corrija los errores en el formulario.",
    };
  }

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl(`/reports/${reportId}/versions`), {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: result.data.title,
        version: result.data.version,
        language: result.data.language,
        summary: result.data.summary,
        citation_text: result.data.citation_text,
      }),
    });

    if (res.status === 201 || res.ok) {
      const data = (await res.json()) as ReportVersion;
      revalidatePath("/admin/reports");
      return {
        success: true,
        data,
        message: "Versión de reporte creada exitosamente.",
      };
    }

    if (res.status === 401) {
      return { success: false, message: "Sesión expirada o token inválido." };
    }

    const errorBody = await res.json().catch(() => ({}));
    const parsedErr = parseApiError(errorBody, "Error al crear la versión del reporte.");
    return {
      success: false,
      message: parsedErr.message,
      errors: parsedErr.errors,
    };
  } catch (error) {
    console.error("Error creating report version via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la API.",
    };
  }
}

/**
 * GET /api/v1/reports/{report_id}/versions/published
 * Obtiene todas las versiones publicadas de un reporte. (Acceso público)
 */
export async function getPublishedVersionsAction(reportId: string): Promise<ReportVersion[]> {
  if (!reportId) return [];

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl(`/reports/${reportId}/versions/published`), {
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = (await res.json()) as ReportVersion[];
      return data;
    }
    console.warn("getPublishedVersionsAction: API returned status", res.status);
  } catch (error) {
    console.error("Error fetching published versions from API:", error);
  }

  return [];
}

/**
 * GET /api/v1/reports/{report_id}/versions/{version_id}
 * Obtiene una versión específica por su ID. (Acceso público)
 */
export async function getReportVersionByIdAction(
  reportId: string,
  versionId: string,
  loadRelations: boolean = false
): Promise<ReportVersion | undefined> {
  if (!reportId || !versionId) return undefined;

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(
      getApiUrl(`/reports/${reportId}/versions/${versionId}?load_relations=${loadRelations}`),
      {
        headers,
        cache: "no-store",
      }
    );

    if (res.ok) {
      const data = (await res.json()) as ReportVersion;
      return data;
    }
    if (res.status === 404) {
      return undefined;
    }
    console.warn("getReportVersionByIdAction: API returned status", res.status);
  } catch (error) {
    console.error("Error fetching report version by ID from API:", error);
  }

  return undefined;
}

/**
 * PATCH /api/v1/reports/{report_id}/versions/{version_id}
 * Actualiza parcialmente una versión de reporte. (Requiere autenticación)
 */
export async function updateReportVersionAction(
  reportId: string,
  versionId: string,
  input: UpdateReportVersionInput
): Promise<{
  success: boolean;
  data?: ReportVersion;
  errors?: Record<string, string[]>;
  message?: string;
}> {
  const result = updateReportVersionSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "Por favor corrija los errores en el formulario.",
    };
  }

  try {
    const headers = await getAuthHeaders();
    const payload: Record<string, unknown> = {};
    if (result.data.title !== undefined) payload.title = result.data.title;
    if (result.data.summary !== undefined) payload.summary = result.data.summary;
    if (result.data.citation_text !== undefined) payload.citation_text = result.data.citation_text;
    if (result.data.status !== undefined) payload.status = result.data.status;

    const res = await fetch(getApiUrl(`/reports/${reportId}/versions/${versionId}`), {
      method: "PATCH",
      headers,
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = (await res.json()) as ReportVersion;
      revalidatePath("/admin/reports");
      return {
        success: true,
        data,
        message: "Versión actualizada exitosamente.",
      };
    }

    if (res.status === 404) {
      return { success: false, message: "Versión no encontrada." };
    }

    if (res.status === 401) {
      return { success: false, message: "Sesión expirada o token inválido." };
    }

    const errorBody = await res.json().catch(() => ({}));
    const parsedErr = parseApiError(errorBody, "Error al actualizar la versión.");
    return {
      success: false,
      message: parsedErr.message,
      errors: parsedErr.errors,
    };
  } catch (error) {
    console.error("Error updating report version via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la API.",
    };
  }
}

/**
 * DELETE /api/v1/reports/{report_id}/versions/{version_id}
 * Elimina una versión de reporte. (Requiere autenticación)
 */
export async function deleteReportVersionAction(
  reportId: string,
  versionId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl(`/reports/${reportId}/versions/${versionId}`), {
      method: "DELETE",
      headers,
    });

    if (res.ok || res.status === 204) {
      revalidatePath("/admin/reports");
      return { success: true, message: "Versión eliminada exitosamente." };
    }

    const errorBody = await res.json().catch(() => ({}));
    return {
      success: false,
      message: errorBody.detail?.[0]?.msg || errorBody.detail || "Error al eliminar la versión.",
    };
  } catch (error) {
    console.error("Error deleting report version via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la API.",
    };
  }
}

/**
 * GET /api/v1/reports/{report_id}/versions/by-language/{language}
 * Obtiene una versión específica por idioma. (Acceso público)
 */
export async function getReportVersionByLanguageAction(
  reportId: string,
  language: "ES" | "EN",
  status?: "DRAFT" | "PUBLISHED"
): Promise<ReportVersion | undefined> {
  if (!reportId || !language) return undefined;

  try {
    const headers = await getAuthHeaders();
    const url = status
      ? getApiUrl(`/reports/${reportId}/versions/by-language/${language}?status=${status}`)
      : getApiUrl(`/reports/${reportId}/versions/by-language/${language}`);

    const res = await fetch(url, {
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = (await res.json()) as ReportVersion;
      return data;
    }
    if (res.status === 404) {
      return undefined;
    }
    console.warn("getReportVersionByLanguageAction: API returned status", res.status);
  } catch (error) {
    console.error("Error fetching version by language from API:", error);
  }

  return undefined;
}

/**
 * GET /api/v1/reports/{report_id}/versions/by-version/{version}
 * Obtiene una versión específica por número de versión. (Acceso público)
 */
export async function getReportVersionByVersionAction(
  reportId: string,
  version: string,
  language?: "ES" | "EN"
): Promise<ReportVersion | undefined> {
  if (!reportId || !version) return undefined;

  try {
    const headers = await getAuthHeaders();
    const url = language
      ? getApiUrl(`/reports/${reportId}/versions/by-version/${version}?language=${language}`)
      : getApiUrl(`/reports/${reportId}/versions/by-version/${version}`);

    const res = await fetch(url, {
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = (await res.json()) as ReportVersion;
      return data;
    }
    if (res.status === 404) {
      return undefined;
    }
    console.warn("getReportVersionByVersionAction: API returned status", res.status);
  } catch (error) {
    console.error("Error fetching version by number from API:", error);
  }

  return undefined;
}

// Helpers para compatibilidad con código existente
export async function getReportByIdAction(id: string): Promise<ReportVersion | undefined> {
  const reports = await getReportsWithVersionsAction();
  for (const r of reports) {
    const found = r.report_versions.find((v) => v.id === id);
    if (found) return found;
  }
  return undefined;
}

export async function getAllReportVersionsAction(): Promise<ReportVersion[]> {
  const reports = await getReportsWithVersionsAction();
  return reports.flatMap((r) => r.report_versions);
}

export async function updateReportAction(
  id: string,
  input: CreateReportVersionInput
): Promise<{
  success: boolean;
  data?: ReportVersion;
  errors?: Record<string, string[]>;
  message?: string;
}> {
  const reports = await getReportsWithVersionsAction();
  for (const r of reports) {
    const found = r.report_versions.find((v) => v.id === id);
    if (found) {
      return updateReportVersionAction(r.id, id, input);
    }
  }
  return { success: false, message: "Reporte o versión no encontrada." };
}


