import { ResourceForm } from "@/features/admin/components/resources/resource-form";
import { getResourceByIdAction } from "@/features/admin/actions/resources-actions";

interface EditResourcePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditResourcePage({ params }: EditResourcePageProps) {
  const { id } = await params;
  const resource = await getResourceByIdAction(id);

  return <ResourceForm isEditMode={true} initialData={resource} />;
}
