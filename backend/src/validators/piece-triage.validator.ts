//backend/src/validators/piece-triage.validator.ts
import { z } from "zod";
export const CreateTriageSchema = z.object({
  vin: z.string().optional(), nis: z.string().regex(/^[0-9]{11}$/).optional(),
  dateFabrication: z.string().datetime().optional(),
  dateLivraison:   z.string().datetime().optional(),
  nitgSaisi: z.string().length(4).toUpperCase(),
  refPieceCauseSaisie: z.string().length(10).toUpperCase().optional(),
  projetVehicule: z.string().optional(), indiceVehicule: z.string().optional(),
  projetMoteur:   z.string().optional(), indiceMoteur:   z.string().optional(),
  projetBoite:    z.string().optional(), indiceBoite:    z.string().optional(),
  codeRef6Plus2: z.string().regex(/^[0-9]{6}-[0-9]{2}$/).optional(),
  nomPiece:      z.string().optional(),
  typePiece:     z.enum(["RC","IC"]),
  numOR: z.string().optional(), dateOR: z.string().datetime().optional(),
  mr: z.number().int().min(0).optional(), km: z.number().int().min(0).optional(),
  verbatimClient: z.string().optional(), diagReparateur: z.string().optional(),
  conclusionTri:  z.string().optional(),
  referencePieceId:   z.string().uuid().optional(),
  correspondanceSetId:z.string().uuid().optional(),
  setId:              z.string().regex(/^[0-9]{5}$/).optional(),
  siteExpeditionId:   z.string().uuid().optional(),
  fournisseurId:      z.string().uuid().optional(),
  garageOrigineId:    z.string().uuid().optional(),
  piloteId:           z.string().uuid().optional(),
  typeRangement: z.enum(["PETITE_BOITE_RC","KARDEX_IC","AUTRE"]).optional(),
  emplacement:   z.string().optional(),
  photoTri1: z.string().url().optional(), photoTri2: z.string().url().optional(),
  photoTri3: z.string().url().optional(), photoTri4: z.string().url().optional(),
});
export const UpdateTriageSchema = CreateTriageSchema.omit({nitgSaisi:true,typePiece:true}).partial();
export const CaffuterSchema     = z.object({ motif: z.string().min(1) });
export type CreateTriageDto = z.infer<typeof CreateTriageSchema>;
export type UpdateTriageDto = z.infer<typeof UpdateTriageSchema>;
export type CaffuterDto     = z.infer<typeof CaffuterSchema>;
