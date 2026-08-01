"use server";

import { revalidatePath } from "next/cache";
import type { CategoryItem } from "../schemas/taxonomy-schema";

let categoriesStore: CategoryItem[] = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-111111111111",
    name: "Facility Layer",
    description: "Energía y cooling",
    display_order: 1,
    active: true,
    concepts: [
      {
        id: "c1b2c3d4-e5f6-7890-abcd-111111111111",
        category_id: "a1b2c3d4-e5f6-7890-abcd-111111111111",
        section_id: "sec-001-intro",
        name: "Enfriamiento ineficiente",
        description: "Métrica técnica sobre disipación térmica",
        display_order: 1,
      },
      {
        id: "c1b2c3d4-e5f6-7890-abcd-222222222222",
        category_id: "a1b2c3d4-e5f6-7890-abcd-111111111111",
        section_id: "sec-002-tax",
        name: "Circuitos subutilizados",
        description: "Monitoreo de potencia nominal",
        display_order: 2,
      },
    ],
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-222222222222",
    name: "IT Layer",
    description: "Infraestructura computacional",
    display_order: 2,
    active: true,
    concepts: [],
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-333333333333",
    name: "Workload Layer",
    description: "Scheduling y orquestación",
    display_order: 3,
    active: true,
    concepts: [],
  },
];

export async function getCategoriesAction(): Promise<CategoryItem[]> {
  return Promise.resolve([...categoriesStore]);
}

export async function getCategoryOptionsAction(): Promise<{ id: string; name: string }[]> {
  return Promise.resolve(
    categoriesStore.map((cat) => ({
      id: cat.id || "",
      name: cat.name,
    }))
  );
}

export async function addCategoryAction(category: Omit<CategoryItem, "id" | "concepts">): Promise<{ success: boolean; data?: CategoryItem }> {
  const newCat: CategoryItem = {
    ...category,
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `cat-${Date.now()}`,
    concepts: [],
  };
  categoriesStore.push(newCat);
  revalidatePath("/admin/taxonomy");
  return { success: true, data: newCat };
}
