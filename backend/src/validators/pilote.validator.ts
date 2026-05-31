import { z } from "zod";
export const CreatePiloteSchema = z.object({
  code: z.string().regex(/^(RC|IC)[0-9]{3}$/,"Format RC411 ou IC039"),
  type: z.enum(["RC","IC"]),
  nom: z.string().optional(), prenom: z.string().optional(),
  userId: z.string().uuid().optional(),
  fournisseurId: z.string().uuid().optional(),
  categorieGeree: z.string().optional(), emplacementKardex: z.string().optional(),
  isActif: z.boolean().default(true),    commentaire: z.string().optional(),
});
export const UpdatePiloteSchema = CreatePiloteSchema.partial();
export type CreatePiloteDto = z.infer<typeof CreatePiloteSchema>;
export type UpdatePiloteDto = z.infer<typeof UpdatePiloteSchema>;
