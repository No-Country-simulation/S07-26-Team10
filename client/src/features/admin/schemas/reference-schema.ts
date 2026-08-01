import { z } from "zod";

export const referenceSchema = z.object({
  id: z.string().uuid().optional(),
  section_id: z.string().min(1, "La sección es obligatoria"),
  authors: z.string().min(1, "Los autores son obligatorios").max(255, "Máximo 255 caracteres"),
  title: z.string().min(1, "El título es obligatorio").max(255, "Máximo 255 caracteres"),
  year: z.number().int().min(1900).max(2100),
  source: z.string().min(1, "La fuente es obligatoria").max(255, "Máximo 255 caracteres"),
  citation_url: z.string().default(""),
  display_order: z.number().int().default(1),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type ReferenceItem = z.infer<typeof referenceSchema>;
