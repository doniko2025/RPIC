//backend/src/validators/auth.validator.ts
import { z } from "zod";
export const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});
export const RegisterSchema = z.object({
  email: z.string().email(), password: z.string().min(8),
  nom: z.string().min(1),    prenom: z.string().min(1),
  lieuTravail: z.string().min(1),
  telephone: z.string().optional(), poste: z.string().optional(),
  typePrincipal: z.enum(["RC","IC"]).optional(),
  role: z.enum(["ADMIN","MANAGER","EMPLOYEE"]).optional(),
});
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8),
});
export const ResetRequestSchema  = z.object({ email: z.string().email() });
export const ResetConfirmSchema  = z.object({ token: z.string().min(1), password: z.string().min(8) });
export const RefreshSchema       = z.object({ refreshToken: z.string().min(1) });
export type LoginDto          = z.infer<typeof LoginSchema>;
export type RegisterDto       = z.infer<typeof RegisterSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
