import { z } from "zod";
export const CreateAnomalieSchema = z.object({
  titre: z.string().min(1), description: z.string().min(1),
  vin: z.string().optional(),  nitg: z.string().length(4).optional(),
  refPieceCause: z.string().length(10).optional(), typePiece: z.enum(["RC","IC"]).optional(),
  photo1: z.string().url().optional(), photo2: z.string().url().optional(),
  photo3: z.string().url().optional(), photo4: z.string().url().optional(),
  statut: z.enum(["A_TRAITER","EN_COURS","RESOLU","IMPOSSIBLE"]).default("A_TRAITER"),
  isDifficulteTri: z.boolean().default(false),
});
export const UpdateAnomalieSchema = CreateAnomalieSchema.partial();
export const ActionCorrectiveSchema = z.object({ description: z.string().min(1) });
export const CommentaireSchema      = z.object({ contenu: z.string().min(1) });
export type CreateAnomalieDto = z.infer<typeof CreateAnomalieSchema>;
export type UpdateAnomalieDto = z.infer<typeof UpdateAnomalieSchema>;
