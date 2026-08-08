import { z } from "zod";

export const conceptSchema = z.object({
  id: z.string().uuid().optional(),
  section_id: z.string().optional(),
  category_id: z.string().min(1, "El ID de la categoría es obligatorio"),
  name: z.string().min(1, "El nombre del concepto es obligatorio").max(150, "Máximo 150 caracteres"),
  description: z.string().default(""),
  display_order: z.number().int().default(1),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type ConceptItem = z.infer<typeof conceptSchema>;

export const createConceptSchema = z.object({
  category_id: z.string().uuid("ID de categoría inválido"),
  name: z.string().min(1, "El nombre del concepto es obligatorio").max(150, "Máximo 150 caracteres"),
  description: z.string().default(""),
  display_order: z.number().int().default(1),
  section_id: z.string().optional(),
});

export type CreateConceptInput = z.infer<typeof createConceptSchema>;

export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  report_id: z.string().uuid().optional(),
  name: z.string().min(1, "El nombre de la categoría es obligatorio").max(150, "Máximo 150 caracteres"),
  description: z.string().default(""),
  display_order: z.number().int().default(1),
  published: z.boolean().optional(),
  active: z.boolean().optional(),
  concepts: z.array(conceptSchema).default([]),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type CategoryItem = z.infer<typeof categorySchema>;

export const createCategorySchema = z.object({
  report_id: z.string().uuid("ID de reporte inválido").optional(),
  name: z.string().min(1, "El nombre de la categoría es obligatorio").max(150, "Máximo 150 caracteres"),
  description: z.string().default(""),
  display_order: z.number().int().default(1),
  published: z.boolean().default(true),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name: z.string().min(1, "El nombre de la categoría es obligatorio").max(150, "Máximo 150 caracteres").optional(),
  description: z.string().optional(),
  display_order: z.number().int().optional(),
  published: z.boolean().optional(),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

