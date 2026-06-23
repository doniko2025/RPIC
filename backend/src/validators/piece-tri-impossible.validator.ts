//backend/src/validators/piece-tri-impossible.validator.ts
import { z } from "zod";
const CATS = ["AUCUNE_DEDUCTION_RPIC","EXPEDITION_IMPOSSIBLE","RECEPTION_IMPOSSIBLE",
  "MAUVAISE_DEDUCTION_SET","SET_INTROUVABLE","NIS_INCONNU","INACTIF_RPIC_6PLUS2_NON_PROPOSE",
  "SET_NON_ACTIF","TRANSFERT_IMPOSSIBLE","BASCULE_TCR","AUTRE"] as const;
export const CreateTriImpSchema = z.object({
  dateConstat: z.string().datetime(), vin: z.string().optional(),
  nis: z.string().regex(/^[0-9]{11}$/).optional(),
  nitg: z.string().length(4), designation: z.string().min(1),
  refPieceCause: z.string().length(10).optional(),
  inscriptionSurPiece: z.string().optional(),
  codeRef6Plus2: z.string().regex(/^[0-9]{6}-[0-9]{2}$/).optional(),
  setIdentifie: z.string().regex(/^[0-9]{5}$/).optional(),
  typePiece: z.enum(["RC","IC"]).optional(),
  agentResponsable: z.string().min(1),
  problemeTri:       z.boolean().default(false),
  problemeExpedition:z.boolean().default(false),
  categorieProbleme: z.enum(CATS).default("AUCUNE_DEDUCTION_RPIC"),
  descriptionProbleme: z.string().min(1),
  inactifRpic6Plus2: z.boolean().default(false),
  basculerTCR: z.boolean().default(false),
  photo1: z.string().url().optional(), photo2: z.string().url().optional(),
  photo3: z.string().url().optional(), photo4: z.string().url().optional(),
});
export const UpdateTriImpSchema = z.object({
  statut: z.enum(["OUVERT","EN_COURS","RESOLU","BASCULE_TCR","ARCHIVE"]).optional(),
  actionCorrective: z.string().optional(), dateResolution: z.string().datetime().optional(),
  categorieProbleme: z.enum(CATS).optional(),
});
export const CommentTriImpSchema = z.object({ contenu: z.string().min(1), auteurNom: z.string().min(1) });
export type CreateTriImpDto = z.infer<typeof CreateTriImpSchema>;
export type UpdateTriImpDto = z.infer<typeof UpdateTriImpSchema>;
