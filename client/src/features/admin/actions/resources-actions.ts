"use server";

import { revalidatePath } from "next/cache";
import type { ResourceItem } from "../schemas/resource-schema";

let resourcesStore: ResourceItem[] = [
  {
    id: "res-001",
    section_id: "sec-001-intro",
    type: "Diagrama",
    title: "Diagrama de arquitectura",
    description: "Representación esquemática de la infraestructura energética",
    file_url: "/uploads/diagrama-arquitectura.png",
    alt_text: "Representación esquemática de la...",
    downloadable: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "res-002",
    section_id: "sec-001-intro",
    type: "Gráfico",
    title: "Gráfico de capacidad",
    description: "Barras comparativas de capacidad nominal vs real",
    file_url: "/uploads/grafico-capacidad.png",
    alt_text: "Barras comparativas de capacidad...",
    downloadable: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "res-003",
    section_id: "sec-001-intro",
    type: "Imagen",
    title: "Infraestructura física",
    description: "Fotografía de alta resolución de la planta térmica",
    file_url: "/uploads/infraestructura.jpg",
    alt_text: "Fotografía de alta resolución de la planta",
    downloadable: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "res-004",
    section_id: "sec-002-tax",
    type: "Diagrama",
    title: "Capas de la taxonomía",
    description: "Visualización de niveles taxonómicos desde Facility hasta Workload",
    file_url: "/uploads/capas-taxonomia.pdf",
    alt_text: "Visualización de niveles taxonómicos desde",
    downloadable: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "res-005",
    section_id: "sec-002-tax",
    type: "Imagen",
    title: "Tabla de comparación",
    description: "Cuadro comparativo de criterios de clasificación",
    file_url: "/uploads/tabla-comparacion.png",
    alt_text: "Cuadro comparativo de criterios de...",
    downloadable: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function getResourcesAction(): Promise<ResourceItem[]> {
  return Promise.resolve([...resourcesStore]);
}

export async function getResourcesBySectionAction(sectionId: string): Promise<ResourceItem[]> {
  return Promise.resolve(resourcesStore.filter((r) => r.section_id === sectionId));
}

export async function addResourceAction(resource: Omit<ResourceItem, "id">): Promise<{ success: boolean; data?: ResourceItem }> {
  const newRes: ResourceItem = {
    ...resource,
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `res-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  resourcesStore.push(newRes);
  revalidatePath("/admin/resources");
  return { success: true, data: newRes };
}

export async function deleteResourceAction(id: string): Promise<{ success: boolean }> {
  resourcesStore = resourcesStore.filter((r) => r.id !== id);
  revalidatePath("/admin/resources");
  return { success: true };
}
