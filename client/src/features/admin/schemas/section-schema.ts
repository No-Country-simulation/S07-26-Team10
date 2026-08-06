import { z } from "zod";

export const createSectionSchema = z.object({
  report_id: z.string().min(1, "El ID de reporte es obligatorio."),
  title: z
    .string()
    .min(1, "El título es obligatorio.")
    .max(255, "El título no puede exceder 255 caracteres."),
  content: z.string().min(1, "El contenido en markdown es obligatorio."),
  display_order: z.number().int().min(1, "El orden debe ser mayor o igual a 1").default(1),
  published: z.boolean().default(false),
});

export type CreateSectionInput = z.infer<typeof createSectionSchema>;

export const updateSectionSchema = z.object({
  title: z
    .string()
    .min(1, "El título es obligatorio.")
    .max(255, "El título no puede exceder 255 caracteres."),
  content: z.string().min(1, "El contenido en markdown es obligatorio."),
  display_order: z.number().int().min(1, "El orden debe ser mayor o igual a 1").default(1),
  published: z.boolean().default(false),
});

export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;

export interface SectionItem {
  id: string;
  report_id: string;
  title: string;
  slug: string;
  content: string;
  display_order: number;
  published: boolean;
  created_at?: string;
  updated_at?: string;
}

