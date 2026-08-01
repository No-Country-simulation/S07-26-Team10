import { ResourceForm } from "@/features/admin/components/resources/resource-form";

interface NewResourcePageProps {
  searchParams?: Promise<{ sectionId?: string }>;
}

export default async function NewResourcePage({ searchParams }: NewResourcePageProps) {
  const params = await searchParams;
  return <ResourceForm isEditMode={false} preselectedSectionId={params?.sectionId} />;
}
