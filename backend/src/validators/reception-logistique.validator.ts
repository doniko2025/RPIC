import { z } from "zod";
export const CreateReceptionSchema = z.object({
  typeBenne: z.enum(["PETITES_PIECES","PIECES_VOLUMINEUSES"]),
  quantite: z.number().int().min(1).default(1),
  dateReception: z.string().datetime().optional(),
  typeFlux: z.enum(["DHL","TRANS","CHRONOPOST","TRANSPORT_STANDARD","AUTRE"]).default("TRANSPORT_STANDARD"),
  numeroBordereau: z.string().optional(),
  commentaire: z.string().optional(),
});
export const UpdateReceptionSchema = CreateReceptionSchema.partial();
export type CreateReceptionDto = z.infer<typeof CreateReceptionSchema>;
export type UpdateReceptionDto = z.infer<typeof UpdateReceptionSchema>;
