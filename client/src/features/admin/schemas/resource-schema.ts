import { z } from "zod";

export const resourceTypeSchema = z.enum(["IMAGE", "GRAPH", "DIAGRAM", "FILE"]);
export type ResourceType = z.infer<typeof resourceTypeSchema>;

export const resourceSchema = z.object({
  id: z.string().optional(),
  section_id: z.string().min(1, "La sección es obligatoria"),
  type: resourceTypeSchema,
  title: z.string().min(1, "El título es obligatorio").max(255, "Máximo 255 caracteres"),
  description: z.string().optional().default(""),
  file_url: z.string().optional().default(""),
  cloudinary_public_id: z.string().optional().default(""),
  alt_text: z.string().optional().default(""),
  downloadable: z.boolean().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const createResourceSchema = z.object({
  section_id: z.string().min(1, "La sección es obligatoria"),
  type: resourceTypeSchema,
  title: z.string().min(1, "El título es obligatorio").max(255, "Máximo 255 caracteres"),
  description: z.string().optional().default(""),
  file_url: z.string().optional().default(""),
  cloudinary_public_id: z.string().optional().default(""),
  alt_text: z.string().optional().default(""),
  downloadable: z.boolean().default(true),
});

export const updateResourceSchema = createResourceSchema.partial().omit({ section_id: true });

export type ResourceItem = z.infer<typeof resourceSchema>;
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;

export const resourceFormSchema = z.object({
  section_id: z.string().min(1, "La sección es obligatoria"),
  type: resourceTypeSchema,
  title: z
    .string()
    .min(1, "El título es obligatorio")
    .max(255, "Máximo 255 caracteres"),
  description: z.string(),
  file_url: z.string(),
  cloudinary_public_id: z.string(),
  alt_text: z.string().min(1, "El texto alternativo es obligatorio"),
  downloadable: z.boolean(),
});

export type ResourceFormInput = z.infer<typeof resourceFormSchema>;


