"use server";

import { revalidatePath } from "next/cache";
import { createSectionSchema, type CreateSectionInput, type SectionItem } from "../schemas/section-schema";

let sectionsStore: SectionItem[] = [
  {
    id: "sec-001-intro",
    title: "Introducción",
    slug: "introduccion",
    description: "Análisis exhaustivo sobre la capacidad no utilizada e infraestructura energética ociosa.",
    introduction: "# Introducción\n\nEl **Stranded Capacity Report 2026** presenta un análisis detallado.",
    methodology: "# Metodología de Cálculo\n\nPara estimar la Capacidad Ociosa.",
    citation_text: "Physa Energy Analytics. (2026). Stranded Capacity Report 2026.",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "sec-002-tax",
    title: "Taxonomía",
    slug: "taxonomia",
    description: "Clasificación jerárquica de métricas de rendimiento.",
    introduction: "Introducción al módulo de taxonomía...",
    methodology: "Metodología aplicada...",
    citation_text: "Physa Energy Analytics. Taxonomía de datos.",
    created_at: new Date(Date.now() - 43200000).toISOString(),
    updated_at: new Date(Date.now() - 43200000).toISOString(),
  }
];

export async function getSectionsAction(): Promise<SectionItem[]> {
  return Promise.resolve([...sectionsStore]);
}

export async function getSectionOptionsAction(): Promise<{ id: string; title: string }[]> {
  return Promise.resolve(
    sectionsStore.map((sec) => ({
      id: sec.id,
      title: sec.title,
    }))
  );
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

  const newSection: SectionItem = {
    ...result.data,
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `sec-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  sectionsStore.push(newSection);

  revalidatePath("/admin/sections");

  return {
    success: true,
    data: newSection,
    message: "Registro guardado exitosamente.",
  };
}
