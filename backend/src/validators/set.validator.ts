//backend/src/validators/set.validator.ts
import { z } from "zod";
export const CreateSetSchema = z.object({
  id: z.string().regex(/^[0-9]{5}$/,"SET = 5 chiffres"),
  libelle: z.string().optional(),       siteExpeditionId: z.string().uuid().optional(),
  destAdresseLigne1: z.string().optional(), destAdresseLigne2: z.string().optional(),
  destCodePostal: z.string().optional(),    destVille: z.string().optional(),
  destPays: z.string().default("France"),
  demandeurNom: z.string().optional(),  demandeurPrenom: z.string().optional(),
  demandeurEmail: z.string().email().optional().or(z.literal("")),
  demandeurTelephone: z.string().optional(),
  isActif: z.boolean().default(true),   commentaire: z.string().optional(),
});
export const UpdateSetSchema = CreateSetSchema.omit({id:true}).partial();
export type CreateSetDto = z.infer<typeof CreateSetSchema>;
export type UpdateSetDto = z.infer<typeof UpdateSetSchema>;
