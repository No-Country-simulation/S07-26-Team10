"use server";

import { revalidatePath, updateTag } from "next/cache";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api-url";

function invalidateTaxonomyTags(reportVersionId?: string) {
  const tags = ["taxonomy", "categories", "concepts", "reports"];
  if (reportVersionId) {
    tags.push(`categories-${reportVersionId}`, `taxonomy-${reportVersionId}`);
  }
  tags.forEach((t) => {
    try {
      updateTag(t);
    } catch {
      // ignore
    }
  });
}
import type {
  CategoryItem,
  CreateCategoryInput,
  UpdateCategoryInput,
  ConceptItem,
  CreateConceptInput,
} from "../schemas/taxonomy-schema";
import {
  createCategorySchema,
  updateCategorySchema,
  createConceptSchema,
} from "../schemas/taxonomy-schema";
import {
  getReportsAction,
  getReportVersionsAction,
  getAllReportVersionsAction,
} from "./reports-actions";

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

function mapCategoryResponse(cat: Record<string, unknown>): CategoryItem {
  const statusVal =
    (cat.status as string) || ((cat.published ?? cat.active) ? "PUBLISHED" : "DRAFT");
  const isPublished = statusVal === "PUBLISHED";
  return {
    id: cat.id as string,
    report_version_id: (cat.report_version_id || cat.report_id) as string,
    report_id: (cat.report_id || cat.report_version_id) as string,
    name: (cat.name as string) ?? "",
    description: (cat.description as string) ?? "",
    display_order:
      typeof cat.display_order === "number" ? cat.display_order : 0,
    status: statusVal as "DRAFT" | "PUBLISHED",
    published: isPublished,
    active: isPublished,
    concepts: Array.isArray(cat.concepts) ? cat.concepts as ConceptItem[] : [],
    created_at: cat.created_at as string | undefined,
    updated_at: cat.updated_at as string | undefined,
  };
}

async function getDefaultReportId(): Promise<string | undefined> {
  const reports = await getReportsAction();
  if (reports[0]?.id) {
    const versions = await getReportVersionsAction(reports[0].id);
    return versions[0]?.id;
  }
  return undefined;
}

export async function getCategoriesAction(
  reportId?: string,
  status?: string,
): Promise<CategoryItem[]> {
  try {
    let targetReportId = reportId;
    if (!targetReportId) {
      targetReportId = await getDefaultReportId();
    }

    if (!targetReportId) {
      console.warn(
        "getCategoriesAction: No report_id provided and no existing reports found.",
      );
      return [];
    }

    const headers = await getAuthHeaders();
    const query = status ? `?status=${status}` : "";
    const urlsToTry = [
      `/report-versions/${targetReportId}/categories/admin${query}`,
      `/report-versions/${targetReportId}/categories${query}`,
      `/categories/report/${targetReportId}/admin${query}`,
    ];

    for (const url of urlsToTry) {
      const res = await fetch(getApiUrl(url), {
        headers,
        cache: "no-store",
      });

      if (res.ok) {
        const data = (await res.json()) as Record<string, unknown>[];
        return data.map(mapCategoryResponse);
      }
    }
  } catch (error) {
    console.error("Error fetching categories from API:", error);
  }

  return [];
}

/**
 * GET /api/v1/report-versions/{report_version_id}/categories/admin/with-concepts
 * Obtiene todas las categorías de una versión con sus conceptos en una sola request.
 * Reemplaza el patrón N+1 de getCategoriesAction + getConceptsByCategoryAction × N.
 */
export async function getCategoriesWithConceptsAction(
  reportVersionId: string,
  skip: number = 0,
  limit: number = 100,
): Promise<CategoryItem[]> {
  if (!reportVersionId) return [];

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(
      getApiUrl(
        `/report-versions/${reportVersionId}/categories/admin/with-concepts?skip=${skip}&limit=${limit}`,
      ),
      { headers, cache: "no-store" },
    );

    if (res.ok) {
      const data = (await res.json()) as Record<string, unknown>[];
      return data.map(mapCategoryResponse);
    }
    console.warn("getCategoriesWithConceptsAction: API returned status", res.status);
  } catch (error) {
    console.error("Error fetching categories with concepts from API:", error);
  }

  return [];
}

export async function getCategoryByIdAction(
  id: string,
  reportVersionId?: string,
): Promise<CategoryItem | undefined> {
  if (!id) return undefined;

  try {
    const headers = await getAuthHeaders();

    if (reportVersionId) {
      const urlsToTry = [
        `/report-versions/${reportVersionId}/categories/admin/${id}`,
        `/report-versions/${reportVersionId}/categories/${id}`,
        `/categories/${id}`,
      ];

      for (const url of urlsToTry) {
        const res = await fetch(getApiUrl(url), {
          headers,
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          return mapCategoryResponse(data);
        }
      }
    }

    const directUrls = [`/categories/${id}/admin`, `/categories/${id}`];

    for (const url of directUrls) {
      const res = await fetch(getApiUrl(url), {
        headers,
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        return mapCategoryResponse(data);
      }
    }

    const reportVersions = await getAllReportVersionsAction();
    for (const rv of reportVersions) {
      const urlsToTry = [
        `/report-versions/${rv.id}/categories/admin/${id}`,
        `/report-versions/${rv.id}/categories/${id}`,
      ];

      for (const url of urlsToTry) {
        const res = await fetch(getApiUrl(url), {
          headers,
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          return mapCategoryResponse(data);
        }
      }
    }
  } catch (error) {
    console.error("Error fetching category by ID from API:", error);
  }

  return undefined;
}

export async function getCategoryOptionsAction(
  reportId?: string,
): Promise<{ id: string; name: string }[]> {
  const categories = await getCategoriesAction(reportId);
  return categories.map((cat) => ({
    id: cat.id || "",
    name: cat.name,
  }));
}

export async function createCategoryAction(
  input: CreateCategoryInput,
): Promise<{
  success: boolean;
  data?: CategoryItem;
  errors?: Record<string, string[]>;
  message?: string;
}> {
  let targetReportId = input.report_id;
  if (!targetReportId) {
    targetReportId = await getDefaultReportId();
  }

  if (!targetReportId) {
    return {
      success: false,
      message: "Se requiere un report_id válido para crear una categoría.",
    };
  }

  const payloadToValidate = {
    ...input,
    report_id: targetReportId,
  };

  const result = createCategorySchema.safeParse(payloadToValidate);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "Por favor corrija los errores en el formulario.",
    };
  }

  try {
    const headers = await getAuthHeaders();
    const urlsToTry = [
      `/report-versions/${targetReportId}/categories`,
      `/categories/`,
    ];

    const statusVal =
      result.data.status || (result.data.published ? "PUBLISHED" : "DRAFT");
    const payload: Record<string, unknown> = {
      name: result.data.name,
      description: result.data.description || "",
      status: statusVal,
    };
    if (
      result.data.display_order !== undefined &&
      result.data.display_order !== null
    ) {
      payload.display_order = result.data.display_order;
    }

    let lastRes: Response | null = null;
    for (const url of urlsToTry) {
      const res = await fetch(getApiUrl(url), {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (res.status === 201 || res.ok) {
        const data = await res.json();
        invalidateTaxonomyTags(targetReportId);
        revalidatePath("/admin/taxonomy");
        revalidatePath("/report/taxonomy");
        revalidatePath("/report");
        revalidatePath("/");
        return {
          success: true,
          data: mapCategoryResponse(data),
          message: "Categoría creada exitosamente.",
        };
      }
      lastRes = res;
    }

    if (lastRes?.status === 401) {
      return {
        success: false,
        message: "Token inválido o expirado.",
      };
    }

    if (lastRes?.status === 404) {
      return {
        success: false,
        message: "Reporte no encontrado.",
      };
    }

    const errorBody = lastRes ? await lastRes.json().catch(() => ({})) : {};
    return {
      success: false,
      message:
        errorBody.detail?.[0]?.msg ||
        errorBody.detail ||
        "Error al crear la categoría.",
    };
  } catch (error) {
    console.error("Error creating category via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la API.",
    };
  }
}

export async function addCategoryAction(
  category: Partial<CategoryItem> & { name: string },
): Promise<{
  success: boolean;
  data?: CategoryItem;
  message?: string;
}> {
  const isPub = category.published ?? category.active ?? true;
  return createCategoryAction({
    report_id: category.report_id,
    name: category.name,
    description: category.description || "",
    display_order: category.display_order || 1,
    status: isPub ? "PUBLISHED" : "DRAFT",
    published: isPub,
  });
}

export async function updateCategoryAction(
  id: string,
  input: UpdateCategoryInput,
  reportVersionId?: string,
): Promise<{
  success: boolean;
  data?: CategoryItem;
  errors?: Record<string, string[]>;
  message?: string;
}> {
  const result = updateCategorySchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "Por favor corrija los errores en el formulario.",
    };
  }

  try {
    const headers = await getAuthHeaders();
    const urlsToTry: string[] = [];

    if (reportVersionId) {
      urlsToTry.push(`/report-versions/${reportVersionId}/categories/${id}`);
    } else {
      const versions = await getAllReportVersionsAction();
      versions.forEach((rv) => {
        urlsToTry.push(`/report-versions/${rv.id}/categories/${id}`);
      });
    }
    urlsToTry.push(`/categories/${id}`);

    const statusVal =
      result.data.status ||
      (result.data.published !== undefined
        ? result.data.published
          ? "PUBLISHED"
          : "DRAFT"
        : undefined);

    const payload: Record<string, unknown> = {};
    if (result.data.name !== undefined) payload.name = result.data.name;
    if (result.data.description !== undefined)
      payload.description = result.data.description;
    if (
      result.data.display_order !== undefined &&
      result.data.display_order !== null
    )
      payload.display_order = result.data.display_order;
    if (statusVal !== undefined) payload.status = statusVal;

    let lastRes: Response | null = null;
    for (const url of urlsToTry) {
      const res = await fetch(getApiUrl(url), {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        invalidateTaxonomyTags(reportVersionId);
        revalidatePath("/admin/taxonomy");
        revalidatePath("/report/taxonomy");
        revalidatePath("/report");
        revalidatePath("/");
        return {
          success: true,
          data: mapCategoryResponse(data),
          message: "Categoría actualizada exitosamente.",
        };
      }
      lastRes = res;
    }

    if (lastRes?.status === 401) {
      return {
        success: false,
        message: "Token inválido o expirado.",
      };
    }

    if (lastRes?.status === 404) {
      return {
        success: false,
        message: "Categoría no encontrada.",
      };
    }

    const errorBody = lastRes ? await lastRes.json().catch(() => ({})) : {};
    return {
      success: false,
      message:
        errorBody.detail?.[0]?.msg ||
        errorBody.detail ||
        "Error al actualizar la categoría.",
    };
  } catch (error) {
    console.error("Error updating category via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la API.",
    };
  }
}

export async function deleteCategoryAction(
  id: string,
  reportVersionId?: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const headers = await getAuthHeaders();
    const urlsToTry: string[] = [];

    if (reportVersionId) {
      urlsToTry.push(`/report-versions/${reportVersionId}/categories/${id}`);
    } else {
      const versions = await getAllReportVersionsAction();
      versions.forEach((rv) => {
        urlsToTry.push(`/report-versions/${rv.id}/categories/${id}`);
      });
    }
    urlsToTry.push(`/categories/${id}`);

    for (const url of urlsToTry) {
      const res = await fetch(getApiUrl(url), {
        method: "DELETE",
        headers,
      });

      if (res.ok || res.status === 204) {
        invalidateTaxonomyTags(reportVersionId);
        revalidatePath("/admin/taxonomy");
        revalidatePath("/report/taxonomy");
        revalidatePath("/report");
        revalidatePath("/");
        return { success: true };
      }
    }

    return {
      success: false,
      message: "Error al eliminar la categoría.",
    };
  } catch (error) {
    console.error("Error deleting category via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la API.",
    };
  }
}

/**
 * GET /api/v1/categories/{category_id}/concepts/admin
 * Listar todos los conceptos de una categoría (admin)
 */
export async function getConceptsByCategoryAction(categoryId: string): Promise<ConceptItem[]> {
  if (!categoryId) return [];

  try {
    const headers = await getAuthHeaders();
    const urlsToTry = [
      `/categories/${categoryId}/concepts/admin`,
      `/categories/${categoryId}/concepts`,
      `/concepts/category/${categoryId}/admin`,
    ];

    for (const url of urlsToTry) {
      const res = await fetch(getApiUrl(url), {
        headers,
        cache: "no-store",
      });

      if (res.ok) {
        const data = (await res.json()) as ConceptItem[];
        return data;
      }
    }
  } catch (error) {
    console.error("Error fetching category concepts from API:", error);
  }

  return [];
}

/**
 * GET /api/v1/categories/{category_id}/concepts/admin/{concept_id}
 * Obtener concepto por ID (admin)
 */
export async function getConceptByIdAction(conceptId: string, categoryId?: string): Promise<ConceptItem | undefined> {
  if (!conceptId) return undefined;

  try {
    const headers = await getAuthHeaders();
    if (categoryId) {
      const urlsToTry = [
        `/categories/${categoryId}/concepts/${conceptId}`,
        `/categories/${categoryId}/concepts/admin/${conceptId}`,
      ];

      for (const url of urlsToTry) {
        const res = await fetch(getApiUrl(url), {
          headers,
          cache: "no-store",
        });

        if (res.ok) {
          const data = (await res.json()) as ConceptItem;
          return data;
        }
      }
    }

    const categories = await getCategoriesAction();
    for (const cat of categories) {
      if (cat.id) {
        const urlsToTry = [
          `/categories/${cat.id}/concepts/${conceptId}`,
          `/categories/${cat.id}/concepts/admin/${conceptId}`,
        ];

        for (const url of urlsToTry) {
          const res = await fetch(getApiUrl(url), {
            headers,
            cache: "no-store",
          });
          if (res.ok) {
            const data = (await res.json()) as ConceptItem;
            return data;
          }
        }
      }
    }

    const fallbackRes = await fetch(getApiUrl(`/concepts/${conceptId}`), {
      headers,
      cache: "no-store",
    });
    if (fallbackRes.ok) {
      const data = (await fallbackRes.json()) as ConceptItem;
      return data;
    }
  } catch (error) {
    console.error("Error fetching concept by ID from API:", error);
  }

  return undefined;
}

/**
 * POST /api/v1/categories/{category_id}/concepts
 * Crear concepto
 */
export async function createConceptAction(input: CreateConceptInput): Promise<{
  success: boolean;
  data?: ConceptItem;
  errors?: Record<string, string[]>;
  message?: string;
}> {
  const result = createConceptSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "Por favor corrija los errores en el formulario.",
    };
  }

  try {
    const categoryId = result.data.category_id;
    if (!categoryId) {
      return { success: false, message: "Debe seleccionar una categoría válida." };
    }

    const headers = await getAuthHeaders();
    const url = `/categories/${categoryId}/concepts`;

    const payload: Record<string, unknown> = {
      name: result.data.name,
      description: result.data.description || "",
    };
    if (result.data.display_order !== undefined && result.data.display_order !== null) {
      payload.display_order = result.data.display_order;
    }

    const res = await fetch(getApiUrl(url), {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (res.status === 201 || res.ok) {
      const data = (await res.json()) as ConceptItem;
      invalidateTaxonomyTags();
      revalidatePath("/admin/taxonomy");
      revalidatePath("/report/taxonomy");
      revalidatePath("/report");
      revalidatePath("/");
      return {
        success: true,
        data,
        message: "Concepto creado exitosamente.",
      };
    }

    if (res.status === 401) {
      return { success: false, message: "Sesión expirada o token inválido." };
    }

    const errorBody = await res.json().catch(() => ({}));
    const errorMessage =
      Array.isArray(errorBody.detail)
        ? (errorBody.detail as Record<string, unknown>[]).map((e) => String((e as Record<string, unknown>).msg || JSON.stringify(e))).join(", ")
        : String(errorBody.detail || errorBody.message || `Error ${res.status}: No se pudo crear el concepto.`);

    return {
      success: false,
      message: errorMessage,
    };
  } catch (error) {
    console.error("Error creating concept via API:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "No se pudo conectar con el servidor de la API.",
    };
  }
}

/**
 * PATCH /api/v1/categories/{category_id}/concepts/{concept_id}
 * Actualizar concepto
 */
export async function updateConceptAction(
  conceptId: string,
  input: Partial<CreateConceptInput>,
  categoryId?: string
): Promise<{
  success: boolean;
  data?: ConceptItem;
  errors?: Record<string, string[]>;
  message?: string;
}> {
  try {
    let targetCategoryId = categoryId || input.category_id;
    if (!targetCategoryId) {
      const concept = await getConceptByIdAction(conceptId, categoryId);
      targetCategoryId = concept?.category_id;
    }

    const headers = await getAuthHeaders();
    const urlsToTry: string[] = [];

    if (targetCategoryId) {
      urlsToTry.push(`/categories/${targetCategoryId}/concepts/${conceptId}`);
    } else {
      const categories = await getCategoriesAction();
      categories.forEach((cat) => {
        if (cat.id) urlsToTry.push(`/categories/${cat.id}/concepts/${conceptId}`);
      });
    }
    urlsToTry.push(`/concepts/${conceptId}`);

    const payload: Record<string, unknown> = {};
    if (input.name !== undefined) payload.name = input.name;
    if (input.description !== undefined) payload.description = input.description;
    if (input.display_order !== undefined && input.display_order !== null) payload.display_order = input.display_order;

    let lastRes: Response | null = null;
    for (const url of urlsToTry) {
      const res = await fetch(getApiUrl(url), {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = (await res.json()) as ConceptItem;
        invalidateTaxonomyTags();
        revalidatePath("/admin/taxonomy");
        revalidatePath("/report/taxonomy");
        revalidatePath("/report");
        revalidatePath("/");
        return {
          success: true,
          data,
          message: "Concepto actualizado exitosamente.",
        };
      }
      lastRes = res;
    }

    if (lastRes?.status === 404) {
      return { success: false, message: "Concepto no encontrado." };
    }

    const errorBody = lastRes ? await lastRes.json().catch(() => ({})) : {};
    return {
      success: false,
      message: errorBody.detail?.[0]?.msg || errorBody.detail || "Error al actualizar el concepto.",
    };
  } catch (error) {
    console.error("Error updating concept via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la API.",
    };
  }
}

/**
 * DELETE /api/v1/categories/{category_id}/concepts/{concept_id}
 * Eliminar concepto
 */
export async function deleteConceptAction(
  conceptId: string,
  categoryId?: string
): Promise<{ success: boolean; message?: string }> {
  if (!conceptId) return { success: false, message: "ID de concepto no válido." };

  try {
    let targetCategoryId = categoryId;
    if (!targetCategoryId) {
      const concept = await getConceptByIdAction(conceptId, categoryId);
      targetCategoryId = concept?.category_id;
    }

    const headers = await getAuthHeaders();
    const urlsToTry: string[] = [];

    if (targetCategoryId) {
      urlsToTry.push(`/categories/${targetCategoryId}/concepts/${conceptId}`);
    } else {
      const categories = await getCategoriesAction();
      categories.forEach((cat) => {
        if (cat.id) urlsToTry.push(`/categories/${cat.id}/concepts/${conceptId}`);
      });
    }
    urlsToTry.push(`/concepts/${conceptId}`);

    let deletedFromDb = false;
    let lastRes: Response | null = null;

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
      } catch (err) {
        console.warn(`Fetch delete concept failed for ${url}:`, err);
      }
    }

    if (deletedFromDb || lastRes?.status === 404) {
      invalidateTaxonomyTags();
      revalidatePath("/admin/taxonomy");
      revalidatePath("/report/taxonomy");
      revalidatePath("/report");
      revalidatePath("/");
      return {
        success: true,
        message: deletedFromDb
          ? "Concepto eliminado exitosamente."
          : "El concepto ya no existía en el servidor.",
      };
    }

    return {
      success: false,
      message: "Error al eliminar el concepto.",
    };
  } catch (error) {
    console.error("Error deleting concept via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la API.",
    };
  }
}
