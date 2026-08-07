"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  createResourceSchema,
  updateResourceSchema,
  type CreateResourceInput,
  type UpdateResourceInput,
  type ResourceItem,
} from "../schemas/resource-schema";
import { getSectionsAction } from "./sections-actions";
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
 * GET /api/v1/resources/section/{section_id}/admin
 * Listar todos los recursos de una sección (visión admin con información completa)
 */
export async function getResourcesBySectionAction(sectionId: string): Promise<ResourceItem[]> {
  if (!sectionId) return [];

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl(`/resources/section/${sectionId}/admin`), {
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = (await res.json()) as ResourceItem[];
      return data;
    }
    console.warn("getResourcesBySectionAction: API returned status", res.status);
  } catch (error) {
    console.error("Error fetching section resources from API:", error);
  }

  return [];
}

/**
 * GET /api/v1/resources/{resource_id}
 * Obtener un recurso por su ID
 */
export async function getResourceByIdAction(resourceId: string): Promise<ResourceItem | undefined> {
  if (!resourceId) return undefined;

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl(`/resources/${resourceId}`), {
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = (await res.json()) as ResourceItem;
      return data;
    }
    if (res.status === 404) {
      return undefined;
    }
    console.warn("getResourceByIdAction: API returned status", res.status);
  } catch (error) {
    console.error("Error fetching resource by ID from API:", error);
  }

  return undefined;
}

/**
 * Obtener todos los recursos de un reporte o de todas las secciones
 */
export async function getResourcesAction(reportId?: string): Promise<ResourceItem[]> {
  try {
    const sections = await getSectionsAction(reportId);
    if (!sections || sections.length === 0) return [];

    const resourcesPerSection = await Promise.all(
      sections.map((sec) => getResourcesBySectionAction(sec.id))
    );

    return resourcesPerSection.flat();
  } catch (error) {
    console.error("Error fetching all resources from API:", error);
    return [];
  }
}

/**
 * POST /api/v1/resources/
 * Crear un nuevo recurso asociado a una sección
 */
export async function createResourceAction(input: CreateResourceInput): Promise<{
  success: boolean;
  data?: ResourceItem;
  errors?: Record<string, string[]>;
  message?: string;
}> {
  const result = createResourceSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "Por favor corrija los errores en el formulario de recurso.",
    };
  }

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl("/resources/"), {
      method: "POST",
      headers,
      body: JSON.stringify({
        section_id: result.data.section_id,
        type: result.data.type,
        title: result.data.title,
        description: result.data.description || "",
        file_url: result.data.file_url || "",
        cloudinary_public_id: result.data.cloudinary_public_id || "",
        alt_text: result.data.alt_text || "",
        downloadable: result.data.downloadable ?? true,
      }),
    });

    if (res.status === 201 || res.ok) {
      const data = (await res.json()) as ResourceItem;
      revalidatePath("/admin/resources");
      revalidatePath(`/admin/sections/${result.data.section_id}`);
      return {
        success: true,
        data,
        message: "Recurso creado exitosamente.",
      };
    }

    if (res.status === 401) {
      return {
        success: false,
        message: "Sesión expirada o token inválido.",
      };
    }

    if (res.status === 404) {
      return {
        success: false,
        message: "Sección no encontrada.",
      };
    }

    const errorBody = await res.json().catch(() => ({}));
    return {
      success: false,
      message: errorBody.detail?.[0]?.msg || errorBody.detail || "Error al crear el recurso.",
    };
  } catch (error) {
    console.error("Error creating resource via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la API.",
    };
  }
}

/**
 * Alias de compatibilidad para addResourceAction
 */
export async function addResourceAction(resource: Omit<ResourceItem, "id">): Promise<{ success: boolean; data?: ResourceItem; message?: string }> {
  return createResourceAction(resource as CreateResourceInput);
}

/**
 * PATCH /api/v1/resources/{resource_id}
 * Actualizar parcialmente un recurso existente
 */
export async function updateResourceAction(
  resourceId: string,
  input: UpdateResourceInput
): Promise<{
  success: boolean;
  data?: ResourceItem;
  errors?: Record<string, string[]>;
  message?: string;
}> {
  const result = updateResourceSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "Por favor corrija los errores en el formulario de recurso.",
    };
  }

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl(`/resources/${resourceId}`), {
      method: "PATCH",
      headers,
      body: JSON.stringify(result.data),
    });

    if (res.ok) {
      const data = (await res.json()) as ResourceItem;
      revalidatePath("/admin/resources");
      if (data.section_id) {
        revalidatePath(`/admin/sections/${data.section_id}`);
      }
      return {
        success: true,
        data,
        message: "Recurso actualizado exitosamente.",
      };
    }

    if (res.status === 404) {
      return { success: false, message: "Recurso no encontrado." };
    }

    if (res.status === 401) {
      return { success: false, message: "Sesión expirada o token inválido." };
    }

    const errorBody = await res.json().catch(() => ({}));
    return {
      success: false,
      message: errorBody.detail?.[0]?.msg || errorBody.detail || "Error al actualizar el recurso.",
    };
  } catch (error) {
    console.error("Error updating resource via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la API.",
    };
  }
}

/**
 * DELETE /api/v1/resources/{resource_id}
 * Eliminar un recurso por ID
 */
export async function deleteResourceAction(resourceId: string): Promise<{ success: boolean; message?: string }> {
  if (!resourceId) return { success: false, message: "ID de recurso no válido." };

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl(`/resources/${resourceId}`), {
      method: "DELETE",
      headers,
    });

    if (res.ok || res.status === 204) {
      revalidatePath("/admin/resources");
      return { success: true, message: "Recurso eliminado exitosamente." };
    }

    const errorBody = await res.json().catch(() => ({}));
    return {
      success: false,
      message: errorBody.detail?.[0]?.msg || errorBody.detail || "Error al eliminar el recurso.",
    };
  } catch (error) {
    console.error("Error deleting resource via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la API.",
    };
  }
}

/**
 * POST /api/v1/uploads/?resource_type={image|raw}
 * Sube una imagen o archivo a Cloudinary y devuelve su metadata
 */
export async function uploadFileAction(
  formData: FormData,
  resourceType: "image" | "raw" = "image"
): Promise<{
  success: boolean;
  data?: {
    file_url: string;
    cloudinary_public_id?: string;
    [key: string]: any;
  };
  message?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(getApiUrl(`/uploads/?resource_type=${resourceType}`), {
      method: "POST",
      headers,
      body: formData,
    });

    if (res.ok || res.status === 201) {
      const data = await res.json();
      const file_url = data.file_url || data.secure_url || data.url || "";
      const cloudinary_public_id = data.cloudinary_public_id || data.public_id || "";

      return {
        success: true,
        data: {
          ...data,
          file_url,
          cloudinary_public_id,
        },
        message: "Archivo subido correctamente a Cloudinary.",
      };
    }

    if (res.status === 401) {
      return { success: false, message: "Sesión expirada o token inválido." };
    }

    const errorBody = await res.json().catch(() => ({}));
    return {
      success: false,
      message: errorBody.detail?.[0]?.msg || errorBody.detail || "Error al subir el archivo.",
    };
  } catch (error) {
    console.error("Error uploading file via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor para subir el archivo.",
    };
  }
}

