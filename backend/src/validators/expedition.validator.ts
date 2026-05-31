import { z } from "zod";
export const CreateExpSchema = z.object({
  numeroExpedition: z.string().min(1),
  transporteur: z.enum(["DHL","TRANS","AUTRE"]).default("DHL"),
  dateExpedition: z.string().datetime(),
  heureExpedition: z.string().datetime().optional(),
  nitg: z.string().length(4).optional(),  vin: z.string().optional(),
  designationPiece: z.string().optional(), refPieceCause: z.string().length(10).optional(),
  typePiece: z.enum(["RC","IC"]).optional(), naturePiece: z.string().optional(),
  setId:              z.string().regex(/^[0-9]{5}$/).optional(),
  siteExpeditionId:   z.string().uuid().optional(),
  fournisseurId:      z.string().uuid().optional(),
  garageDestinationId:z.string().uuid().optional(),
  piloteId:           z.string().uuid().optional(),
  statut: z.enum(["EXPEDIE","ARRIVE","RETOURNE","REFUSE","EN_ATTENTE","ANNULE"]).default("EXPEDIE"),
  commentaire: z.string().optional(),
});
export const UpdateExpSchema = CreateExpSchema.partial();
export type CreateExpDto = z.infer<typeof CreateExpSchema>;
export type UpdateExpDto = z.infer<typeof UpdateExpSchema>;
