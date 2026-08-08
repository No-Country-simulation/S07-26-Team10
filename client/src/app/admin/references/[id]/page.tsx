import { notFound } from "next/navigation";
import { getReferenceByIdAction } from "@/features/admin/actions/references-actions";
import { ReferenceForm } from "@/features/admin/components/references/reference-form";

interface EditReferencePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditReferencePage({ params }: EditReferencePageProps) {
  const { id } = await params;
  const reference = await getReferenceByIdAction(id);

  if (!reference) {
    notFound();
  }

  return <ReferenceForm isEditMode={true} initialData={reference} />;
}
