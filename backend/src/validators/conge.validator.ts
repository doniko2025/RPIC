//backend/src/validators/conge.validator.ts
import { z } from "zod";

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format attendu : YYYY-MM-DD");

export const CreateCongeSchema = z.object({
  dateDebut:  dateStr,
  dateFin:    dateStr,
  typeConge:  z.enum(["CONGE_PAYE", "RTT", "MALADIE", "FORMATION", "AUTRE"]),
  motif:      z.string().optional(),
}).refine(
  (d) => new Date(d.dateFin) >= new Date(d.dateDebut),
  { message: "dateFin doit être >= dateDebut", path: ["dateFin"] }
);

export const UpdateCongeSchema = z.object({
  motif:     z.string().optional(),
  typeConge: z.enum(["CONGE_PAYE", "RTT", "MALADIE", "FORMATION", "AUTRE"]).optional(),
});

export const MarquerVuSchema = z.object({ noteAdmin: z.string().optional() });

export type CreateCongeDto = z.infer<typeof CreateCongeSchema>;
export type UpdateCongeDto = z.infer<typeof UpdateCongeSchema>;