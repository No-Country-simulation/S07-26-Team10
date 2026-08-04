"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createReportSchema, type CreateReportInput, type ReportItem } from "../schemas/report-schema";
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

export async function getReportsAction(): Promise<ReportItem[]> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl("/reports/"), {
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = (await res.json()) as ReportItem[];
      return data;
    }
    console.warn("getReportsAction: API returned status", res.status);
  } catch (error) {
    console.error("Error fetching reports from API:", error);
  }

  return [];
}

export async function getReportByIdAction(id: string): Promise<ReportItem | undefined> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl(`/reports/${id}/admin`), {
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = (await res.json()) as ReportItem;
      return data;
    }
    if (res.status === 404) {
      return undefined;
    }
    console.warn("getReportByIdAction: API returned status", res.status);
  } catch (error) {
    console.error("Error fetching report by ID from API:", error);
  }

  return undefined;
}

export async function createReportAction(input: CreateReportInput): Promise<{
  success: boolean;
  data?: ReportItem;
  errors?: Record<string, string[]>;
  message?: string;
}> {
  const result = createReportSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "Por favor corrija los errores en el formulario.",
    };
  }

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl("/reports/"), {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: result.data.title,
        summary: result.data.summary,
        citation_text: result.data.citation_text,
      }),
    });

    if (res.status === 201 || res.ok) {
      const data = (await res.json()) as ReportItem;
      revalidatePath("/admin/reports");
      return {
        success: true,
        data,
        message: "Reporte creado exitosamente.",
      };
    }

    if (res.status === 409) {
      return {
        success: false,
        message: "El slug para este reporte ya se encuentra registrado.",
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
      message: errorBody.detail?.[0]?.msg || errorBody.detail || "Error al crear el reporte.",
    };
  } catch (error) {
    console.error("Error creating report via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la API.",
    };
  }
}

export async function updateReportAction(
  id: string,
  input: CreateReportInput
): Promise<{
  success: boolean;
  data?: ReportItem;
  errors?: Record<string, string[]>;
  message?: string;
}> {
  const result = createReportSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "Por favor corrija los errores en el formulario.",
    };
  }

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl(`/reports/${id}`), {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        title: result.data.title,
        summary: result.data.summary,
        citation_text: result.data.citation_text,
      }),
    });

    if (res.ok) {
      const data = (await res.json()) as ReportItem;
      revalidatePath("/admin/reports");
      return {
        success: true,
        data,
        message: "Reporte actualizado exitosamente.",
      };
    }

    if (res.status === 404) {
      return { success: false, message: "Reporte no encontrado." };
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
      message: errorBody.detail?.[0]?.msg || errorBody.detail || "Error al actualizar el reporte.",
    };
  } catch (error) {
    console.error("Error updating report via API:", error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la API.",
    };
  }
}

export async function deleteReportAction(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl(`/reports/${id}`), {
      method: "DELETE",
      headers,
    });

    if (res.ok || res.status === 204) {
      revalidatePath("/admin/reports");
      return { success: true };
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
