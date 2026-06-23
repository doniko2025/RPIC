//backend/src/validators/piece-logistique.validator.ts
import { z } from "zod";
export const CreatePieceLogSchema = z.object({
  typePiece: z.enum(["MOTEUR","BOITE_VITESSE"]),
  quantite: z.number().int().min(1),
  nitg: z.string().length(4).optional(), refPieceCause: z.string().length(10).optional(),
  vin: z.string().optional(),
  fournisseurId: z.string().uuid().optional(), fournisseurLibre: z.string().optional(),
  dateArrivee: z.string().datetime().optional(), lieuStockage: z.string().optional(),
  typeFlux: z.enum(["DHL","TRANS","CHRONOPOST","TRANSPORT_STANDARD","AUTRE"]).default("TRANSPORT_STANDARD"),
  commentaire: z.string().optional(),
});
export const UpdatePieceLogSchema = CreatePieceLogSchema.partial();
export type CreatePieceLogDto = z.infer<typeof CreatePieceLogSchema>;
export type UpdatePieceLogDto = z.infer<typeof UpdatePieceLogSchema>;
