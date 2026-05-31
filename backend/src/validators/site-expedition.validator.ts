import { z } from "zod";
export const CreateSiteSchema = z.object({
  code6Plus2: z.string().regex(/^[0-9]{6}-[0-9]{2}$/,"Format XXXXXX-XX requis"),
  nom: z.string().min(1),
  adresseLigne1: z.string().optional(), adresseLigne2: z.string().optional(),
  codePostal: z.string().optional(),    ville: z.string().optional(),
  pays: z.string().default("France"),   fournisseurId: z.string().uuid().optional(),
  isActif: z.boolean().default(true),   commentaire: z.string().optional(),
});
export const UpdateSiteSchema = CreateSiteSchema.partial();
export type CreateSiteDto = z.infer<typeof CreateSiteSchema>;
export type UpdateSiteDto = z.infer<typeof UpdateSiteSchema>;
