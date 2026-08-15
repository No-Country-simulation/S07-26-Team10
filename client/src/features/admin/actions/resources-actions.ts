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
import { getSectionsAction, getSectionsWithResourcesAction } from "./sections-actions";
import { getReportsWithVersionsAction } from "./reports-actions";
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
 * GET /api/v1/sections/{section_id}/resources/admin
 * Listar todos los recursos de una sección (visión admin con información completa)
 */
export async function getResourcesBySectionAction(sectionId: string): Promise<ResourceItem[]> {
  if (!sectionId) return [];

  try {
    const headers = await getAuthHeaders();
    const urlsToTry = [
      `/sections/${sectionId}/resources/admin`,
      `/sections/${sectionId}/resources`,
      `/resources/section/${sectionId}/admin`,
    ];

    for (const url of urlsToTry) {
      const res = await fetch(getApiUrl(url), {
        headers,
        cache: "no-store",
      });

      if (res.ok) {
        const data = (await res.json()) as ResourceItem[];
        return data;
      }
    }
  } catch (error) {
    console.error("Error fetching section resources from API:", error);
  }

  return [];
}

export async function getResourceByIdAction(resourceId: string, sectionId?: string): Promise<ResourceItem | undefined> {
  if (!resourceId) return undefined;

  try {
    const headers = await getAuthHeaders();

    if (sectionId) {
      const urlsToTry = [
        `/sections/${sectionId}/resources/admin/${resourceId}`,
        `/sections/${sectionId}/resources/${resourceId}`,
      ];

      for (const url of urlsToTry) {
        const res = await fetch(getApiUrl(url), {
          headers,
          cache: "no-store",
        });

        if (res.ok) {
          const data = (await res.json()) as ResourceItem;
          return {
            ...data,
            section_id: data.section_id || sectionId,
          };
        }
      }
    }

    // Si no tenemos sectionId, buscar a través de los reportes y versiones
    const reports = await getReportsWithVersionsAction();
    const allVersions = reports.flatMap((r) => r.report_versions || []);

    for (const ver of allVersions) {
      const sectionsWithRes = await getSectionsWithResourcesAction(ver.id);
      for (const sec of sectionsWithRes) {
        const found = sec.resources?.find((r) => r.id === resourceId);
        if (found) {
          return {
            ...found,
            section_id: sec.id,
          };
        }
      }
    }
  } catch (error) {
    console.error("Error fetching resource by ID from API:", error);
  }

  return undefined;
}

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
    const sectionId = result.data.section_id;
    const urlsToTry = [
      `/sections/${sectionId}/resources`,
      `/resources/`,
    ];

    let lastRes: Response | null = null;
    for (const url of urlsToTry) {
      const res = await fetch(getApiUrl(url), {
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
      lastRes = res;
    }

    if (lastRes?.status === 401) {
      return {
        success: false,
        message: "Sesión expirada o token inválido.",
      };
    }

    if (lastRes?.status === 404) {
      return {
        success: false,
        message: "Sección no encontrada.",
      };
    }

    const errorBody = lastRes ? await lastRes.json().catch(() => ({})) : {};
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

export async function addResourceAction(resource: Omit<ResourceItem, "id">): Promise<{ success: boolean; data?: ResourceItem; message?: string }> {
  return createResourceAction(resource as CreateResourceInput);
}

export async function updateResourceAction(
  resourceId: string,
  input: UpdateResourceInput & { old_cloudinary_public_id?: string },
  sectionId?: string
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
    let targetSectionId = sectionId || (input as Record<string, unknown>).section_id as string | undefined;

    if (!targetSectionId) {
      const currentResource = await getResourceByIdAction(resourceId, sectionId);
      targetSectionId = currentResource?.section_id;
    }

    const urlsToTry = targetSectionId
      ? [
          `/sections/${targetSectionId}/resources/${resourceId}`,
          `/resources/${resourceId}`,
        ]
      : [`/resources/${resourceId}`];

    const payload: Record<string, unknown> = {};
    if (result.data.type !== undefined) payload.type = result.data.type;
    if (result.data.title !== undefined) payload.title = result.data.title;
    if (result.data.description !== undefined) payload.description = result.data.description;
    if (result.data.file_url !== undefined) payload.file_url = result.data.file_url;
    if (result.data.cloudinary_public_id !== undefined) payload.cloudinary_public_id = result.data.cloudinary_public_id;
    if (result.data.alt_text !== undefined) payload.alt_text = result.data.alt_text;
    if (result.data.downloadable !== undefined) payload.downloadable = result.data.downloadable;

    let lastRes: Response | null = null;
    for (const url of urlsToTry) {
      const res = await fetch(getApiUrl(url), {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = (await res.json()) as ResourceItem;
        revalidatePath("/admin/resources");
        if (data.section_id) {
          revalidatePath(`/admin/sections/${data.section_id}`);
        }

        // Automatic Cloudinary file cleanup if file was replaced
        if (
          input.old_cloudinary_public_id &&
          result.data.cloudinary_public_id &&
          input.old_cloudinary_public_id !== result.data.cloudinary_public_id
        ) {
          const resType = (result.data.type || data.type) === "IMAGE" ? "image" : "raw";
          await deleteUploadAction(input.old_cloudinary_public_id, resType).catch((err) => {
            console.warn("Could not delete old Cloudinary file on update:", err);
          });
        }

        return {
          success: true,
          data,
          message: "Recurso actualizado exitosamente.",
        };
      }
      lastRes = res;
    }

    if (lastRes?.status === 404) {
      return { success: false, message: "Recurso no encontrado." };
    }

    if (lastRes?.status === 401) {
      return { success: false, message: "Sesión expirada o token inválido." };
    }

    const errorBody = lastRes ? await lastRes.json().catch(() => ({})) : {};
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

export async function deleteResourceAction(
  resourceId: string,
  sectionId?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _cloudinaryPublicId?: string
): Promise<{ success: boolean; message?: string }> {
  if (!resourceId) return { success: false, message: "ID de recurso no válido." };

  try {
    let targetSectionId = sectionId;

    // Retrieve resource details if sectionId was not provided
    if (!targetSectionId) {
      const resource = await getResourceByIdAction(resourceId, sectionId);
      if (resource?.section_id) {
        targetSectionId = resource.section_id;
      }
    }

    const headers = await getAuthHeaders();
    const urlsToTry: string[] = [];

    if (targetSectionId) {
      urlsToTry.push(`/sections/${targetSectionId}/resources/${resourceId}`);
    } else {
      const sections = await getSectionsAction();
      for (const sec of sections) {
        if (sec.id) {
          urlsToTry.push(`/sections/${sec.id}/resources/${resourceId}`);
        }
      }
    }
    urlsToTry.push(`/resources/${resourceId}`);

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
      revalidatePath("/admin/resources");
      if (targetSectionId) {
        revalidatePath(`/admin/sections/${targetSectionId}`);
      }

      return {
        success: true,
        message: deletedFromDb
          ? "Recurso eliminado exitosamente."
          : "El recurso ya no existía en el servidor y ha sido removido.",
      };
    }

    if (lastRes?.status === 401) {
      return { success: false, message: "Sesión expirada o token inválido." };
    }

    return {
      success: false,
      message: lastErrorMsg || (lastRes ? `Error ${lastRes.status}: No se pudo eliminar el recurso.` : "Error al eliminar el recurso."),
    };
  } catch (error) {
    console.error("Error deleting resource via API:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "No se pudo conectar con el servidor de la API.",
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
    [key: string]: unknown;
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

    const urlsToTry = [
      `/uploads?resource_type=${resourceType}`,
      `/uploads/?resource_type=${resourceType}`,
    ];

    let lastRes: Response | null = null;
    for (const url of urlsToTry) {
      const res = await fetch(getApiUrl(url), {
        method: "POST",
        headers,
        body: formData,
      });

      if (res.ok || res.status === 201) {
        const data = await res.json();
        const file_url = data.url || data.file_url || data.secure_url || "";
        const cloudinary_public_id = data.public_id || data.cloudinary_public_id || "";

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
      lastRes = res;
    }

    if (lastRes?.status === 401) {
      return { success: false, message: "Sesión expirada o token inválido." };
    }

    const errorBody = lastRes ? await lastRes.json().catch(() => ({})) : {};
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

/**
 * DELETE /api/v1/uploads/{public_id}?resource_type={image|raw}
 * Elimina un archivo de Cloudinary
 */
export async function deleteUploadAction(
  publicId: string,
  resourceType: "image" | "raw" = "image"
): Promise<{ success: boolean; message?: string }> {
  if (!publicId) return { success: false, message: "ID público de Cloudinary no proporcionado." };

  try {
    const headers = await getAuthHeaders();
    const encodedPublicId = encodeURIComponent(publicId);

    const urlsToTry = [
      `/uploads/${encodedPublicId}?resource_type=${resourceType}`,
      `/uploads/${publicId}?resource_type=${resourceType}`,
    ];

    for (const url of urlsToTry) {
      const res = await fetch(getApiUrl(url), {
        method: "DELETE",
        headers,
      });

      if (res.ok || res.status === 200 || res.status === 204) {
        return {
          success: true,
          message: "Archivo eliminado exitosamente de Cloudinary.",
        };
      }
    }

    return {
      success: false,
      message: "Error al eliminar el archivo de Cloudinary.",
    };
  } catch (error) {
    console.error("Error deleting upload from Cloudinary via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor para eliminar el archivo.",
    };
  }
}


