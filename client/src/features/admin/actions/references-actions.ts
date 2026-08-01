"use server";

import { revalidatePath } from "next/cache";
import type { ReferenceItem } from "../schemas/reference-schema";

let referencesStore: ReferenceItem[] = [
  {
    id: "ref-001",
    section_id: "sec-001-intro",
    authors: "Smith, J.",
    title: "Data Center Efficiency Metrics",
    year: 2023,
    source: "IEEE TRANSACTIONS",
    citation_url: "https://doi.org/10.1109/TQE.2023.3289012",
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "ref-002",
    section_id: "sec-001-intro",
    authors: "García, M.",
    title: "Energy Waste in AI Infrastructure",
    year: 2024,
    source: "J. OF SUSTAINABLE COMPUTING",
    citation_url: "https://doi.org/10.1016/j.suscom.2024.100912",
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "ref-003",
    section_id: "sec-002-tax",
    authors: "Chen, L.",
    title: "Cooling Systems and Computational Load",
    year: 2023,
    source: "INTL DATA CENTER CONF",
    citation_url: "https://doi.org/10.1145/3571234.3571290",
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function getReferencesAction(): Promise<ReferenceItem[]> {
  return Promise.resolve([...referencesStore]);
}

export async function getReferencesBySectionAction(sectionId: string): Promise<ReferenceItem[]> {
  return Promise.resolve(referencesStore.filter((r) => r.section_id === sectionId));
}

export async function addReferenceAction(ref: Omit<ReferenceItem, "id">): Promise<{ success: boolean; data?: ReferenceItem }> {
  const newRef: ReferenceItem = {
    ...ref,
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `ref-${Date.now()}`,
    citation_url: `https://doi.org/10.1016/physaflow.${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  referencesStore.push(newRef);
  revalidatePath("/admin/references");
  return { success: true, data: newRef };
}

export async function deleteReferenceAction(id: string): Promise<{ success: boolean }> {
  referencesStore = referencesStore.filter((r) => r.id !== id);
  revalidatePath("/admin/references");
  return { success: true };
}
