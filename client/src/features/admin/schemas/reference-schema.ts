import { z } from "zod";

export const createReferenceSchema = z.object({
  report_id: z.string().uuid("El ID del reporte debe ser un UUID válido"),
  authors: z.string().min(1, "Los autores son obligatorios").max(255, "Máximo 255 caracteres"),
  title: z.string().min(1, "El título es obligatorio").max(255, "Máximo 255 caracteres"),
  year: z.coerce.number().int().min(1800, "Año inválido").max(2100, "Año inválido"),
  source: z.string().min(1, "La fuente es obligatoria").max(255, "Máximo 255 caracteres"),
  citation_url: z.string().optional().default(""),
});

export const updateReferenceSchema = z.object({
  authors: z.string().min(1, "Los autores son obligatorios").max(255, "Máximo 255 caracteres"),
  title: z.string().min(1, "El título es obligatorio").max(255, "Máximo 255 caracteres"),
  year: z.coerce.number().int().min(1800, "Año inválido").max(2100, "Año inválido"),
  source: z.string().min(1, "La fuente es obligatoria").max(255, "Máximo 255 caracteres"),
  citation_url: z.string().optional().default(""),
  display_order: z.coerce.number().int().default(1),
});

export const referenceSchema = z.object({
  id: z.string().uuid(),
  report_id: z.string().uuid(),
  authors: z.string(),
  title: z.string(),
  year: z.number().int(),
  source: z.string(),
  citation_url: z.string(),
  display_order: z.number().int(),
  created_at: z.string().optional(),
});

export type ReferenceItem = z.infer<typeof referenceSchema>;
export type CreateReferenceInput = z.infer<typeof createReferenceSchema>;
export type UpdateReferenceInput = z.infer<typeof updateReferenceSchema>;
