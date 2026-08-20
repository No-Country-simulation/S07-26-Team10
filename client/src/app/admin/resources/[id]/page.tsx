import { ResourceForm } from "@/features/admin/components/resources/resource-form";
import { getResourceByIdAction } from "@/features/admin/actions/resources-actions";

interface EditResourcePageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ sectionId?: string }>;
}

export default async function EditResourcePage({ params, searchParams }: EditResourcePageProps) {
  const { id } = await params;
  const sParams = searchParams ? await searchParams : undefined;
  const sectionId = sParams?.sectionId;
  const resource = await getResourceByIdAction(id, sectionId);

  return (
    <ResourceForm
      isEditMode={true}
      initialData={resource}
      preselectedSectionId={sectionId || resource?.section_id}
    />
  );
}
