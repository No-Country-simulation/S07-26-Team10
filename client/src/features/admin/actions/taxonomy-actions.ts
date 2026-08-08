"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api-url";
import type { CategoryItem, CreateCategoryInput, UpdateCategoryInput, ConceptItem, CreateConceptInput } from "../schemas/taxonomy-schema";
import { createCategorySchema, updateCategorySchema, createConceptSchema } from "../schemas/taxonomy-schema";
import { getReportsAction } from "./reports-actions";

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

function mapCategoryResponse(cat: any): CategoryItem {
  const isPublished = cat.published ?? cat.active ?? true;
  return {
    id: cat.id,
    report_id: cat.report_id,
    name: cat.name ?? "",
    description: cat.description ?? "",
    display_order: typeof cat.display_order === "number" ? cat.display_order : 1,
    published: isPublished,
    active: isPublished,
    concepts: Array.isArray(cat.concepts) ? cat.concepts : [],
    created_at: cat.created_at,
    updated_at: cat.updated_at,
  };
}

async function getDefaultReportId(): Promise<string | undefined> {
  const reports = await getReportsAction();
  return reports[0]?.id;
}

export async function getCategoriesAction(reportId?: string): Promise<CategoryItem[]> {
  try {
    let targetReportId = reportId;
    if (!targetReportId) {
      targetReportId = await getDefaultReportId();
    }

    if (!targetReportId) {
      console.warn("getCategoriesAction: No report_id provided and no existing reports found.");
      return [];
    }

    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl(`/categories/report/${targetReportId}/admin`), {
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = (await res.json()) as any[];
      return data.map(mapCategoryResponse);
    }
    console.warn("getCategoriesAction: API returned status", res.status);
  } catch (error) {
    console.error("Error fetching categories from API:", error);
  }

  return [];
}

export async function getCategoryByIdAction(id: string): Promise<CategoryItem | undefined> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl(`/categories/${id}`), {
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return mapCategoryResponse(data);
    }
    if (res.status === 404) {
      return undefined;
    }
    console.warn("getCategoryByIdAction: API returned status", res.status);
  } catch (error) {
    console.error("Error fetching category by ID from API:", error);
  }

  return undefined;
}

export async function getCategoryOptionsAction(reportId?: string): Promise<{ id: string; name: string }[]> {
  const categories = await getCategoriesAction(reportId);
  return categories.map((cat) => ({
    id: cat.id || "",
    name: cat.name,
  }));
}

export async function createCategoryAction(input: CreateCategoryInput): Promise<{
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
    const res = await fetch(getApiUrl("/categories/"), {
      method: "POST",
      headers,
      body: JSON.stringify({
        report_id: result.data.report_id,
        name: result.data.name,
        description: result.data.description,
        display_order: result.data.display_order,
        published: result.data.published,
      }),
    });

    if (res.status === 201 || res.ok) {
      const data = await res.json();
      revalidatePath("/admin/taxonomy");
      return {
        success: true,
        data: mapCategoryResponse(data),
        message: "Categoría creada exitosamente.",
      };
    }

    if (res.status === 401) {
      return {
        success: false,
        message: "Token inválido o expirado.",
      };
    }

    if (res.status === 404) {
      return {
        success: false,
        message: "Reporte no encontrado.",
      };
    }

    const errorBody = await res.json().catch(() => ({}));
    return {
      success: false,
      message: errorBody.detail?.[0]?.msg || errorBody.detail || "Error al crear la categoría.",
    };
  } catch (error) {
    console.error("Error creating category via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la API.",
    };
  }
}

export async function addCategoryAction(category: Partial<CategoryItem> & { name: string }): Promise<{
  success: boolean;
  data?: CategoryItem;
  message?: string;
}> {
  return createCategoryAction({
    report_id: category.report_id,
    name: category.name,
    description: category.description || "",
    display_order: category.display_order || 1,
    published: category.published ?? category.active ?? true,
  });
}

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
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl("/concepts/"), {
      method: "POST",
      headers,
      body: JSON.stringify({
        category_id: result.data.category_id,
        name: result.data.name,
        description: result.data.description,
        display_order: result.data.display_order,
      }),
    });

    if (res.status === 201 || res.ok) {
      const data = (await res.json()) as ConceptItem;
      revalidatePath("/admin/taxonomy");
      return {
        success: true,
        data,
        message: "Concepto creado exitosamente.",
      };
    }

    if (res.status === 401) {
      return {
        success: false,
        message: "Token inválido o expirado.",
      };
    }

    if (res.status === 404) {
      return {
        success: false,
        message: "Categoría no encontrada.",
      };
    }

    const errorBody = await res.json().catch(() => ({}));
    return {
      success: false,
      message: errorBody.detail?.[0]?.msg || errorBody.detail || "Error al crear el concepto.",
    };
  } catch (error) {
    console.error("Error creating concept via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la API.",
    };
  }
}

export async function updateCategoryAction(
  id: string,
  input: UpdateCategoryInput
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
    const res = await fetch(getApiUrl(`/categories/${id}`), {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        ...(result.data.name !== undefined && { name: result.data.name }),
        ...(result.data.description !== undefined && { description: result.data.description }),
        ...(result.data.display_order !== undefined && { display_order: result.data.display_order }),
        ...(result.data.published !== undefined && { published: result.data.published }),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      revalidatePath("/admin/taxonomy");
      return {
        success: true,
        data: mapCategoryResponse(data),
        message: "Categoría actualizada exitosamente.",
      };
    }

    if (res.status === 401) {
      return {
        success: false,
        message: "Token inválido o expirado.",
      };
    }

    if (res.status === 404) {
      return {
        success: false,
        message: "Categoría no encontrada.",
      };
    }

    const errorBody = await res.json().catch(() => ({}));
    return {
      success: false,
      message: errorBody.detail?.[0]?.msg || errorBody.detail || "Error al actualizar la categoría.",
    };
  } catch (error) {
    console.error("Error updating category via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la API.",
    };
  }
}

export async function deleteCategoryAction(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl(`/categories/${id}`), {
      method: "DELETE",
      headers,
    });

    if (res.ok || res.status === 204) {
      revalidatePath("/admin/taxonomy");
      return { success: true };
    }

    if (res.status === 401) {
      return {
        success: false,
        message: "Token inválido o expirado.",
      };
    }

    if (res.status === 404) {
      return {
        success: false,
        message: "Categoría no encontrada.",
      };
    }

    const errorBody = await res.json().catch(() => ({}));
    return {
      success: false,
      message: errorBody.detail?.[0]?.msg || errorBody.detail || "Error al eliminar la categoría.",
    };
  } catch (error) {
    console.error("Error deleting category via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la API.",
    };
  }
}
