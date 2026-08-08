import { CategoryForm } from "@/features/admin/components/taxonomy/category-form";
import { getCategoryByIdAction } from "@/features/admin/actions/taxonomy-actions";
import { notFound } from "next/navigation";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await getCategoryByIdAction(id);

  if (!category) {
    notFound();
  }

  return <CategoryForm isEditMode={true} initialData={category} />;
}
