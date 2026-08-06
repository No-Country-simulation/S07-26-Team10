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

export async function getSectionsAction(reportId?: string): Promise<SectionItem[]> {
  if (!reportId) return [];

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl(`/sections/report/${reportId}/admin`), {
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = (await res.json()) as SectionItem[];
      return data;
    }
    console.warn("getSectionsAction: API returned status", res.status);
  } catch (error) {
    console.error("Error fetching sections from API:", error);
  }

  return [];
}

export async function getSectionByIdAction(sectionId: string): Promise<SectionItem | undefined> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl(`/sections/${sectionId}/admin`), {
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = (await res.json()) as SectionItem;
      return data;
    }
    if (res.status === 404) {
      return undefined;
    }
    console.warn("getSectionByIdAction: API returned status", res.status);
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
    const res = await fetch(getApiUrl("/sections/"), {
      method: "POST",
      headers,
      body: JSON.stringify({
        report_id: result.data.report_id,
        title: result.data.title,
        content: result.data.content,
        display_order: result.data.display_order,
        published: result.data.published,
      }),
    });

    if (res.status === 201 || res.ok) {
      const data = (await res.json()) as SectionItem;
      revalidatePath("/admin/sections");
      return {
        success: true,
        data,
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
    return {
      success: false,
      message: errorBody.detail?.[0]?.msg || errorBody.detail || "Error al crear la sección.",
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
  input: UpdateSectionInput
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
    const res = await fetch(getApiUrl(`/sections/${sectionId}`), {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        title: result.data.title,
        content: result.data.content,
        display_order: result.data.display_order,
        published: result.data.published,
      }),
    });

    if (res.ok) {
      const data = (await res.json()) as SectionItem;
      revalidatePath("/admin/sections");
      return {
        success: true,
        data,
        message: "Sección actualizada exitosamente.",
      };
    }

    if (res.status === 404) {
      return { success: false, message: "Sección no encontrada." };
    }

    if (res.status === 409) {
      return { success: false, message: "El slug ya se encuentra registrado." };
    }

    if (res.status === 401) {
      return { success: false, message: "Sesión expirada o token inválido." };
    }

    const errorBody = await res.json().catch(() => ({}));
    return {
      success: false,
      message: errorBody.detail?.[0]?.msg || errorBody.detail || "Error al actualizar la sección.",
    };
  } catch (error) {
    console.error("Error updating section via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la API.",
    };
  }
}

export async function deleteSectionAction(sectionId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl(`/sections/${sectionId}`), {
      method: "DELETE",
      headers,
    });

    if (res.ok || res.status === 204) {
      revalidatePath("/admin/sections");
      return { success: true, message: "Sección eliminada exitosamente." };
    }

    const errorBody = await res.json().catch(() => ({}));
    return {
      success: false,
      message: errorBody.detail?.[0]?.msg || errorBody.detail || "Error al eliminar la sección.",
    };
  } catch (error) {
    console.error("Error deleting section via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la API.",
    };
  }
}

