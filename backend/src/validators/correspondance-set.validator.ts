import { z } from "zod";
const projFields = {
  projetVehicule:z.string().optional(), indiceVehicule:z.string().optional(),
  projetMoteur:z.string().optional(),   indiceMoteur:z.string().optional(),
  projetBoite:z.string().optional(),    indiceBoite:z.string().optional(),
};
export const SearchCorrSchema = z.object({
  nitg: z.string().length(4).toUpperCase(),
  refPieceCause: z.string().length(10).toUpperCase().optional(),
  typePiece: z.enum(["RC","IC"]).optional(),
  ...projFields,
});
export const CreateCorrSchema = z.object({
  nitg: z.string().length(4).toUpperCase(),
  refPieceCause: z.string().length(10).toUpperCase(),
  typePiece: z.enum(["RC","IC"]),
  setId: z.string().regex(/^[0-9]{5}$/),
  siteExpeditionId: z.string().uuid().optional(),
  fournisseurId:    z.string().uuid().optional(),
  codeRef6Plus2:    z.string().regex(/^[0-9]{6}-[0-9]{2}$/).optional(),
  referencePieceId: z.string().uuid().optional(),
  ...projFields,
});
export const UpdateCorrSchema = CreateCorrSchema.omit({nitg:true,refPieceCause:true}).partial();
export const ConfirmerSchema  = z.object({ piloteId:z.string().uuid().optional(), note:z.string().optional() });
export type SearchCorrDto  = z.infer<typeof SearchCorrSchema>;
export type CreateCorrDto  = z.infer<typeof CreateCorrSchema>;
export type UpdateCorrDto  = z.infer<typeof UpdateCorrSchema>;
