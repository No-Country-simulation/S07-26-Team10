import { CategoryForm } from "@/features/admin/components/taxonomy/category-form";
import type { CategoryItem } from "@/features/admin/schemas/taxonomy-schema";

const MOCK_EDIT_CATEGORY: CategoryItem = {
  id: "a1b2c3d4-e5f6-7890-abcd-111111111111",
  name: "Facility Layer",
  description: "Energía y cooling",
  display_order: 1,
  active: true,
  concepts: [],
};

export default function EditCategoryPage() {
  return <CategoryForm isEditMode={true} initialData={MOCK_EDIT_CATEGORY} />;
}
