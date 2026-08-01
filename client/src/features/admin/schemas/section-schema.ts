import { z } from "zod";

export const createSectionSchema = z.object({
  title: z
    .string()
    .min(1, "El título es obligatorio.")
    .max(255, "El título no puede exceder 255 caracteres."),
  slug: z
    .string()
    .min(1, "El slug es obligatorio.")
    .max(255, "El slug no puede exceder 255 caracteres.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "El slug solo puede contener letras minúsculas, números y guiones (ej. introduccion)."
    ),
  description: z.string(),
  introduction: z.string(),
  methodology: z.string(),
  citation_text: z.string(),
});

export type CreateSectionInput = z.infer<typeof createSectionSchema>;

export interface SectionItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  introduction: string;
  methodology: string;
  citation_text: string;
  created_at?: string;
  updated_at?: string;
}
