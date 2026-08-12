"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  createSectionSchema,
  updateSectionSchema,
  type CreateSectionInput,
  type UpdateSectionInput,
  type SectionItem,
} from "../schemas/section-schema";
import type { ResourceItem } from "../schemas/resource-schema";
import { getApiUrl } from "@/lib/api-url";

/**
 * Sección con sus recursos embebidos (respuesta del endpoint with-resources).
 */
export interface SectionWithResources extends SectionItem {
  resources: ResourceItem[];
}

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

function mapSectionResponse(sec: Record<string, unknown>): SectionItem {
  const statusVal = (sec.status as string) || (sec.published ? "PUBLISHED" : "DRAFT");
  const isPublished = statusVal === "PUBLISHED";
  return {
    id: sec.id as string,
    report_version_id: (sec.report_version_id || sec.report_id) as string,
    report_id: (sec.report_id || sec.report_version_id) as string,
    title: (sec.title as string) ?? "",
    slug: (sec.slug as string) ?? "",
    content: (sec.content as string) ?? "",
    display_order: typeof sec.display_order === "number" ? sec.display_order : 1,
    status: statusVal as "DRAFT" | "PUBLISHED",
    published: isPublished,
    created_at: sec.created_at as string | undefined,
    updated_at: sec.updated_at as string | undefined,
  };
}

export async function getSectionsAction(reportId?: string, status?: string): Promise<SectionItem[]> {
  if (!reportId) return [];

  try {
    const headers = await getAuthHeaders();
    const query = status ? `?status=${status}` : "";
    const urlsToTry = [
      `/report-versions/${reportId}/sections/admin${query}`,
      `/report-versions/${reportId}/sections${query}`,
      `/sections/report/${reportId}/admin${query}`,
      `/sections/report/${reportId}${query}`,
    ];

    for (const url of urlsToTry) {
      const res = await fetch(getApiUrl(url), {
        headers,
        cache: "no-store",
      });

      if (res.ok) {
        const data = (await res.json()) as Record<string, unknown>[];
        return data.map(mapSectionResponse);
      }
    }
    console.warn("getSectionsAction: None of the endpoints returned OK for ID:", reportId);
  } catch (error) {
    console.error("Error fetching sections from API:", error);
  }

  return [];
}

/**
 * GET /api/v1/report-versions/{report_version_id}/sections/admin/with-resources
 * Obtiene todas las secciones de una versión con sus recursos en una sola request.
 * Reemplaza el patrón 2× de getSectionsAction + getResourcesAction en paralelo.
 */
export async function getSectionsWithResourcesAction(
  reportVersionId: string,
  skip: number = 0,
  limit: number = 100,
): Promise<SectionWithResources[]> {
  if (!reportVersionId) return [];

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(
      getApiUrl(
        `/report-versions/${reportVersionId}/sections/admin/with-resources?skip=${skip}&limit=${limit}`,
      ),
      { headers, cache: "no-store" },
    );

    if (res.ok) {
      const data = (await res.json()) as Record<string, unknown>[];
      return data.map((sec) => ({
        ...mapSectionResponse(sec),
        resources: Array.isArray(sec.resources)
          ? (sec.resources as ResourceItem[])
          : [],
      }));
    }
    console.warn("getSectionsWithResourcesAction: API returned status", res.status);
  } catch (error) {
    console.error("Error fetching sections with resources from API:", error);
  }

  return [];
}


import { getAllReportVersionsAction } from "./reports-actions";

export async function getSectionByIdAction(sectionId: string, reportVersionId?: string): Promise<SectionItem | undefined> {
  if (!sectionId) return undefined;

  try {
    const headers = await getAuthHeaders();

    if (reportVersionId) {
      const urlsToTry = [
        `/report-versions/${reportVersionId}/sections/admin/${sectionId}`,
        `/report-versions/${reportVersionId}/sections/${sectionId}`,
      ];

      for (const u of urlsToTry) {
        const res = await fetch(getApiUrl(u), { headers, cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          return mapSectionResponse(data);
        }
      }
    }

    const directUrls = [
      `/sections/${sectionId}/admin`,
      `/sections/${sectionId}`,
    ];

    for (const u of directUrls) {
      const res = await fetch(getApiUrl(u), { headers, cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        return mapSectionResponse(data);
      }
    }

    const reportVersions = await getAllReportVersionsAction();
    for (const rv of reportVersions) {
      const urlsToTry = [
        `/report-versions/${rv.id}/sections/admin/${sectionId}`,
        `/report-versions/${rv.id}/sections/${sectionId}`,
      ];

      for (const u of urlsToTry) {
        const res = await fetch(getApiUrl(u), { headers, cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          return mapSectionResponse(data);
        }
      }
    }
  } catch (error) {
    console.error("Error fetching section by ID from API:", error);
  }

  return undefined;
}


export async function getSectionOptionsAction(reportId?: string): Promise<{ id: string; title: string }[]> {
  if (!reportId) return [];
  const sections = await getSectionsAction(reportId);
  return sections.map((sec) => ({
    id: sec.id,
    title: sec.title,
  }));
}

export async function createSectionAction(input: CreateSectionInput): Promise<{
  success: boolean;
  data?: SectionItem;
  errors?: Record<string, string[]>;
  message?: string;
}> {
  const result = createSectionSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "Por favor corrija los errores en el formulario.",
    };
  }

  try {
    const headers = await getAuthHeaders();
    const reportVersionId = result.data.report_id;
    const statusVal = result.data.status || (result.data.published ? "PUBLISHED" : "DRAFT");

    const payload: Record<string, unknown> = {
      title: result.data.title,
      content: result.data.content,
      status: statusVal,
    };
    if (result.data.display_order !== undefined && result.data.display_order !== null) {
      payload.display_order = result.data.display_order;
    }

    const res = await fetch(getApiUrl(`/report-versions/${reportVersionId}/sections`), {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (res.status === 201 || res.ok) {
      const data = await res.json();
      revalidatePath("/admin/sections");
      return {
        success: true,
        data: mapSectionResponse(data),
        message: "Sección creada exitosamente.",
      };
    }

    if (res.status === 409) {
      return {
        success: false,
        message: "El slug para esta sección ya se encuentra registrado.",
      };
    }

    if (res.status === 401) {
      return {
        success: false,
        message: "Sesión expirada o token inválido.",
      };
    }

    const errorBody = await res.json().catch(() => ({}));
    const parsedErr = parseApiError(errorBody, "Error al crear la sección.");
    return {
      success: false,
      message: parsedErr.message,
      errors: parsedErr.errors,
    };
  } catch (error) {
    console.error("Error creating section via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la API.",
    };
  }
}

export async function updateSectionAction(
  sectionId: string,
  input: UpdateSectionInput,
  reportVersionId?: string
): Promise<{
  success: boolean;
  data?: SectionItem;
  errors?: Record<string, string[]>;
  message?: string;
}> {
  const result = updateSectionSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "Por favor corrija los errores en el formulario.",
    };
  }

  try {
    const headers = await getAuthHeaders();
    const statusVal = result.data.status || (result.data.published !== undefined ? (result.data.published ? "PUBLISHED" : "DRAFT") : undefined);

    const payload: Record<string, unknown> = {};
    if (result.data.title !== undefined) payload.title = result.data.title;
    if (result.data.content !== undefined) payload.content = result.data.content;
    if (result.data.display_order !== undefined) payload.display_order = result.data.display_order;
    if (statusVal !== undefined) payload.status = statusVal;

    const urlsToTry: string[] = [];

    if (reportVersionId) {
      urlsToTry.push(`/report-versions/${reportVersionId}/sections/${sectionId}`);
    } else {
      const versions = await getAllReportVersionsAction();
      versions.forEach((rv) => {
        urlsToTry.push(`/report-versions/${rv.id}/sections/${sectionId}`);
      });
    }
    urlsToTry.push(`/sections/${sectionId}`);

    let lastRes: Response | null = null;
    for (const u of urlsToTry) {
      const res = await fetch(getApiUrl(u), {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        revalidatePath("/admin/sections");
        return {
          success: true,
          data: mapSectionResponse(data),
          message: "Sección actualizada exitosamente.",
        };
      }
      lastRes = res;
    }

    if (lastRes?.status === 404) {
      return { success: false, message: "Sección no encontrada." };
    }

    if (lastRes?.status === 409) {
      return { success: false, message: "El slug ya se encuentra registrado." };
    }

    if (lastRes?.status === 401) {
      return { success: false, message: "Sesión expirada o token inválido." };
    }

    const errorBody = lastRes ? await lastRes.json().catch(() => ({})) : {};
    const parsedErr = parseApiError(errorBody, "Error al actualizar la sección.");
    return {
      success: false,
      message: parsedErr.message,
      errors: parsedErr.errors,
    };
  } catch (error) {
    console.error("Error updating section via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la API.",
    };
  }
}

export async function deleteSectionAction(sectionId: string, reportVersionId?: string): Promise<{ success: boolean; message?: string }> {
  try {
    const headers = await getAuthHeaders();
    const urlsToTry: string[] = [];

    if (reportVersionId) {
      urlsToTry.push(`/report-versions/${reportVersionId}/sections/${sectionId}`);
    } else {
      const versions = await getAllReportVersionsAction();
      versions.forEach((rv) => {
        urlsToTry.push(`/report-versions/${rv.id}/sections/${sectionId}`);
      });
    }
    urlsToTry.push(`/sections/${sectionId}`);

    for (const u of urlsToTry) {
      const res = await fetch(getApiUrl(u), {
        method: "DELETE",
        headers,
      });

      if (res.ok || res.status === 204) {
        revalidatePath("/admin/sections");
        return { success: true, message: "Sección eliminada exitosamente." };
      }
    }

    return {
      success: false,
      message: "Error al eliminar la sección.",
    };
  } catch (error) {
    console.error("Error deleting section via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la API.",
    };
  }
}



