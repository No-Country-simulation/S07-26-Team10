import { z } from "zod";

export const createReferenceSchema = z.object({
  report_version_id: z.string().optional(),
  report_id: z.string().optional(),
  authors: z.string().min(1, "Los autores son obligatorios").max(255, "Máximo 255 caracteres"),
  title: z.string().min(1, "El título es obligatorio").max(255, "Máximo 255 caracteres"),
  year: z.coerce.number().int().min(1000, "Año inválido").max(2100, "Año inválido"),
  source: z.string().min(1, "La fuente es obligatoria").max(255, "Máximo 255 caracteres"),
  citation_url: z.string().optional().default(""),
  display_order: z.coerce.number().int().optional(),
});

export const updateReferenceSchema = createReferenceSchema.partial();

export const referenceSchema = z.object({
  id: z.string(),
  report_version_id: z.string().optional(),
  report_id: z.string().optional(),
  authors: z.string(),
  title: z.string(),
  year: z.number().int(),
  source: z.string(),
  citation_url: z.string().optional().default(""),
  display_order: z.number().int().optional().default(0),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type ReferenceItem = z.infer<typeof referenceSchema>;
export type CreateReferenceInput = z.infer<typeof createReferenceSchema>;
export type UpdateReferenceInput = z.infer<typeof updateReferenceSchema>;
