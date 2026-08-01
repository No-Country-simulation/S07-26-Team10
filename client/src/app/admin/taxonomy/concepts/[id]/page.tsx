import { ConceptForm } from "@/features/admin/components/taxonomy/concept-form";
import type { ConceptItem } from "@/features/admin/schemas/taxonomy-schema";

const MOCK_EDIT_CONCEPT: ConceptItem = {
  id: "c1b2c3d4-e5f6-7890-abcd-111111111111",
  category_id: "a1b2c3d4-e5f6-7890-abcd-111111111111",
  section_id: "sec-001-intro",
  name: "Enfriamiento ineficiente",
  description: "Métrica técnica sobre disipación térmica",
  display_order: 1,
};

export default function EditConceptPage() {
  return <ConceptForm isEditMode={true} initialData={MOCK_EDIT_CONCEPT} />;
}
