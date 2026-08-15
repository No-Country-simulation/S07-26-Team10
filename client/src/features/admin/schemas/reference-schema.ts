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

export const referenceFormSchema = z.object({
  report_id: z.string().min(1, "El reporte es obligatorio"),
  authors: z
    .string()
    .min(1, "Los autores son obligatorios")
    .max(255, "Máximo 255 caracteres"),
  title: z
    .string()
    .min(1, "El título es obligatorio")
    .max(255, "Máximo 255 caracteres"),
  year: z
    .number({ message: "El año debe ser un número entero" })
    .int("El año debe ser un número entero")
    .min(1000, "Año inválido (mínimo 1000)")
    .max(2100, "Año inválido (máximo 2100)"),
  source: z
    .string()
    .min(1, "La fuente es obligatoria")
    .max(255, "Máximo 255 caracteres"),
  citation_url: z.string(),
  display_order: z
    .number()
    .int("El orden debe ser un número entero")
    .min(0, "El orden debe ser mayor o igual a 0")
    .optional()
    .nullable(),
});

export type ReferenceFormInput = z.infer<typeof referenceFormSchema>;
