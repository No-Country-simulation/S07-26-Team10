import { z } from "zod";

export const baseReportSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type BaseReport = z.infer<typeof baseReportSchema>;

export const reportLanguageEnum = z.enum(["ES", "EN"]);
export type ReportLanguage = z.infer<typeof reportLanguageEnum>;

export const reportVersionStatusEnum = z.enum(["DRAFT", "PUBLISHED"]);
export type ReportVersionStatus = z.infer<typeof reportVersionStatusEnum>;

export const reportVersionSchema = z.object({
  id: z.string().uuid(),
  report_id: z.string().uuid(),
  title: z.string().min(1, "El título es obligatorio").max(255, "Máximo 255 caracteres"),
  version: z.string().min(1, "La versión es obligatoria"),
  language: reportLanguageEnum.default("ES"),
  summary: z.string().min(1, "El resumen es obligatorio"),
  citation_text: z.string().min(1, "El texto de citación es obligatorio"),
  status: reportVersionStatusEnum.default("DRAFT"),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  sections: z.array(z.any()).optional(),
  references: z.array(z.any()).optional(),
  categories: z.array(z.any()).optional(),
});

export type ReportVersion = z.infer<typeof reportVersionSchema>;

export const createReportVersionSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(255, "Máximo 255 caracteres"),
  version: z.string().min(1, "La versión es obligatoria"),
  language: reportLanguageEnum.default("ES"),
  summary: z.string().min(1, "El resumen es obligatorio"),
  citation_text: z.string().min(1, "El texto de citación es obligatorio"),
});

export type CreateReportVersionInput = z.infer<typeof createReportVersionSchema>;

export const updateReportVersionSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(255, "Máximo 255 caracteres").optional(),
  summary: z.string().min(1, "El resumen es obligatorio").optional(),
  citation_text: z.string().min(1, "El texto de citación es obligatorio").optional(),
  status: reportVersionStatusEnum.optional(),
});

export type UpdateReportVersionInput = z.infer<typeof updateReportVersionSchema>;

// Compatibilidad retroactiva mientras se realiza la migración
export const reportSchema = reportVersionSchema;
export type ReportItem = ReportVersion;
export const createReportSchema = createReportVersionSchema;
export type CreateReportInput = CreateReportVersionInput;

/**
 * Tipo para el endpoint GET /api/v1/reports/admin/with-versions
 * Devuelve cada reporte base con su array de versiones embebido.
 */
export interface ReportWithVersions extends BaseReport {
  report_versions: ReportVersion[];
}
