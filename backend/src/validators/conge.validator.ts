import { z } from "zod";
export const CreateCongeSchema = z.object({
  dateDebut: z.string().datetime(), dateFin: z.string().datetime(),
  motif: z.string().optional(),
}).refine(d=>new Date(d.dateFin)>=new Date(d.dateDebut),{message:"dateFin doit être >= dateDebut",path:["dateFin"]});
export const UpdateCongeSchema  = CreateCongeSchema.partial();
export const MarquerVuSchema    = z.object({ noteAdmin: z.string().optional() });
export type CreateCongeDto = z.infer<typeof CreateCongeSchema>;
export type UpdateCongeDto = z.infer<typeof UpdateCongeSchema>;
