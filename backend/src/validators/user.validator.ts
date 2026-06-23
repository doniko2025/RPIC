//backend/src/validators/user.validator.ts
import { z } from "zod";
export const CreateUserSchema = z.object({
  email: z.string().email(), password: z.string().min(8),
  nom: z.string().min(1),    prenom: z.string().min(1),
  telephone: z.string().optional(), role: z.enum(["ADMIN","MANAGER","EMPLOYEE"]).default("EMPLOYEE"),
  matricule: z.string().optional(), lieuTravail: z.string().min(1),
  poste: z.string().optional(),     typePrincipal: z.enum(["RC","IC"]).optional(),
  adresseLigne1: z.string().optional(), adresseLigne2: z.string().optional(),
  codePostal: z.string().optional(),    ville: z.string().optional(),
  pays: z.string().default("France"),
});
export const UpdateUserSchema = CreateUserSchema.omit({password:true}).partial();
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
