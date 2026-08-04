import { ReportForm } from "@/features/admin/components/reports/report-form";
import { getReportByIdAction } from "@/features/admin/actions/reports-actions";

interface EditReportPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditReportPage({ params }: EditReportPageProps) {
  const { id } = await params;
  const report = await getReportByIdAction(id);

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-muted-foreground">Reporte no encontrado.</p>
      </div>
    );
  }

  return <ReportForm isEditMode={true} initialData={report} />;
}
