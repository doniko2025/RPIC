//backend/src/validators/fournisseur.validator.ts
import { z } from "zod";
export const CreateFournisseurSchema = z.object({
  nom: z.string().min(1), codeInterne: z.string().optional(),
  adresseRetourLigne1: z.string().optional(), adresseRetourLigne2: z.string().optional(),
  codePostalRetour: z.string().optional(),    villeRetour: z.string().optional(),
  paysRetour: z.string().default("France"),
  contactNom: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactTelephone: z.string().optional(),
  delaiExpeMaxRC: z.number().int().min(1).max(30).default(7),
  isActif: z.boolean().default(true), commentaire: z.string().optional(),
});
export const UpdateFournisseurSchema = CreateFournisseurSchema.partial();
export type CreateFournisseurDto = z.infer<typeof CreateFournisseurSchema>;
export type UpdateFournisseurDto = z.infer<typeof UpdateFournisseurSchema>;
