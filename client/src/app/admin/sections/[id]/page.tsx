import { SectionForm } from "@/features/admin/components/sections/section-form";
import { getSectionByIdAction } from "@/features/admin/actions/sections-actions";

interface EditSectionPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSectionPage({ params }: EditSectionPageProps) {
  const { id } = await params;
  const section = await getSectionByIdAction(id);

  if (!section) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-muted-foreground">Sección no encontrada.</p>
      </div>
    );
  }

  return <SectionForm isEditMode={true} initialData={section} />;
}
