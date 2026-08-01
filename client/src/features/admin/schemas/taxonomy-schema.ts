import { z } from "zod";

export const conceptSchema = z.object({
  id: z.string().uuid().optional(),
  section_id: z.string().min(1, "El ID de la sección es obligatorio"),
  category_id: z.string().min(1, "El ID de la categoría es obligatorio"),
  name: z.string().min(1, "El nombre del concepto es obligatorio").max(150, "Máximo 150 caracteres"),
  description: z.string().default(""),
  display_order: z.number().int().default(1),
});

export type ConceptItem = z.infer<typeof conceptSchema>;

export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "El nombre de la categoría es obligatorio").max(150, "Máximo 150 caracteres"),
  description: z.string().default(""),
  display_order: z.number().int().default(1),
  active: z.boolean().default(true),
  concepts: z.array(conceptSchema).default([]),
});

export type CategoryItem = z.infer<typeof categorySchema>;
