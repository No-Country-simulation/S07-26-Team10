import { notFound } from "next/navigation";
import { ConceptForm } from "@/features/admin/components/taxonomy/concept-form";
import { getConceptByIdAction } from "@/features/admin/actions/taxonomy-actions";

interface EditConceptPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ category_id?: string }>;
}

export default async function EditConceptPage({ params, searchParams }: EditConceptPageProps) {
  const { id } = await params;
  const { category_id } = await searchParams;
  const concept = await getConceptByIdAction(id, category_id);

  if (!concept) {
    notFound();
  }

  return <ConceptForm isEditMode={true} initialData={concept} />;
}
