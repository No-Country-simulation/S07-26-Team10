import { z } from "zod";

export const resourceSchema = z.object({
  id: z.string().uuid().optional(),
  section_id: z.string().min(1, "La sección es obligatoria"),
  type: z.string().min(1, "El tipo de recurso es obligatorio"),
  title: z.string().min(1, "El título es obligatorio").max(255, "Máximo 255 caracteres"),
  description: z.string().default(""),
  file_url: z.string().default(""),
  alt_text: z.string().default(""),
  downloadable: z.boolean().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type ResourceItem = z.infer<typeof resourceSchema>;
