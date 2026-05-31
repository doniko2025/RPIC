import { z } from "zod";
export const CreateGarageSchema = z.object({
  nom: z.string().min(1), codeGarage: z.string().optional(),
  adresseLigne1: z.string().optional(), adresseLigne2: z.string().optional(),
  codePostal: z.string().optional(),    ville: z.string().optional(),
  pays: z.string().default("France"),
  contactNom: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactTelephone: z.string().optional(),
  isActif: z.boolean().default(true), commentaire: z.string().optional(),
});
export const UpdateGarageSchema = CreateGarageSchema.partial();
export type CreateGarageDto = z.infer<typeof CreateGarageSchema>;
export type UpdateGarageDto = z.infer<typeof UpdateGarageSchema>;
