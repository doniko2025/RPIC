import { z } from "zod";
export const CreateMentionSchema = z.object({
  version: z.string().min(1), titre: z.string().min(1),
  contenu: z.string().min(1), isActive: z.boolean().default(true),
});
export const UpdateMentionSchema = CreateMentionSchema.partial();
export type CreateMentionDto = z.infer<typeof CreateMentionSchema>;
export type UpdateMentionDto = z.infer<typeof UpdateMentionSchema>;
