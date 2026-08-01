import { ResourceForm } from "@/features/admin/components/resources/resource-form";
import type { ResourceItem } from "@/features/admin/schemas/resource-schema";

const MOCK_EDIT_RESOURCE: ResourceItem = {
  id: "res-001",
  section_id: "sec-001-intro",
  type: "Diagrama",
  title: "Diagrama de arquitectura",
  description: "Representación esquemática de la infraestructura energética",
  file_url: "/uploads/diagrama-arquitectura.png",
  alt_text: "Representación esquemática de la...",
  downloadable: true,
};

export default function EditResourcePage() {
  return <ResourceForm isEditMode={true} initialData={MOCK_EDIT_RESOURCE} />;
}
