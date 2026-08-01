"use server";

import { revalidatePath } from "next/cache";
import { createSectionSchema, type CreateSectionInput, type SectionItem } from "../schemas/section-schema";

let sectionsStore: SectionItem[] = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    title: "Stranded Capacity Report 2026",
    slug: "stranded-capacity-report-2026",
    description: "Análisis exhaustivo sobre la capacidad no utilizada e infraestructura energética ociosa en el mercado térmico regional.",
    introduction: `# Introducción

El **Stranded Capacity Report 2026** presenta un análisis detallado sobre el desempeño del mercado energético.

## Contexto y Alcance

Este informe evalúa el impacto financiero y técnico de las plantas de generación con baja utilización:
* Evaluación de capacidad disponible vs. despacho real.
* Costos fijos y variables del sistema.
* Recomendaciones de transición hacia modelos más eficientes.

> "La optimización de activos energéticos requiere transparencia de datos y análisis continuo."`,
    methodology: `# Metodología de Cálculo

Para estimar la **Capacidad Ociosa (Stranded Capacity)**, aplicamos la siguiente formulación:

1. **Recopilación de Datos Horarios**: Monitoreo de potencia disponible y despacho efectivo.
2. **Cálculo de Factor de Planta**: Comparación entre generación real y capacidad nominal.
3. **Simulación de Escenarios**: Evaluaciones bajo estrés térmico e hidrológico.`,
    citation_text: "Physa Energy Analytics. (2026). Stranded Capacity Report 2026: Análisis de Resiliencia Energética. Editorials & Research Group.",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  }
];

export async function getSectionsAction(): Promise<SectionItem[]> {
  return Promise.resolve([...sectionsStore]);
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
