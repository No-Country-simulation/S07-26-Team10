import { ReferenceForm } from "@/features/admin/components/references/reference-form";

interface NewReferencePageProps {
  searchParams?: Promise<{ sectionId?: string }>;
}

export default async function NewReferencePage({ searchParams }: NewReferencePageProps) {
  const params = await searchParams;
  return <ReferenceForm isEditMode={false} preselectedSectionId={params?.sectionId} />;
}
