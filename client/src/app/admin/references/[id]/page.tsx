import { ReferenceForm } from "@/features/admin/components/references/reference-form";
import type { ReferenceItem } from "@/features/admin/schemas/reference-schema";

const MOCK_EDIT_REFERENCE: ReferenceItem = {
  id: "ref-001",
  section_id: "sec-001-intro",
  authors: "Smith, J.",
  title: "Data Center Efficiency Metrics",
  year: 2023,
  source: "IEEE TRANSACTIONS",
  citation_url: "https://doi.org/10.1109/TQE.2023.3289012",
  display_order: 1,
};

export default function EditReferencePage() {
  return <ReferenceForm isEditMode={true} initialData={MOCK_EDIT_REFERENCE} />;
}
