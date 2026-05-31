import { z } from "zod";
export const CreateRefSchema = z.object({
  nitg: z.string().length(4,"NITG = 4 car.").toUpperCase(),
  nis:  z.string().regex(/^[0-9]{11}$/).optional(),
  refPieceCause: z.string().length(10,"Réf = 10 car.").toUpperCase(),
  typePiece: z.enum(["RC","IC"]),
  nomPiece:  z.string().min(1),
  codeRef6Plus2: z.string().regex(/^[0-9]{6}-[0-9]{2}$/).optional(),
  fournisseurId: z.string().uuid().optional(), fournisseurLibre: z.string().optional(),
  photo1: z.string().url().optional(), photo2: z.string().url().optional(),
  photo3: z.string().url().optional(), photo4: z.string().url().optional(),
  inscriptionSurPiece: z.string().optional(), conclusionDeTri: z.string().optional(),
  isActifRpic: z.boolean().default(true),      commentaireTri: z.string().optional(),
});
export const UpdateRefSchema = CreateRefSchema.partial();
export type CreateRefDto = z.infer<typeof CreateRefSchema>;
export type UpdateRefDto = z.infer<typeof UpdateRefSchema>;
