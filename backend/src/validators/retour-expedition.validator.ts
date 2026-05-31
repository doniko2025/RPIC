import { z } from "zod";
const CAUSES = ["NON_COMMUNIQUE","RETOUR_SANS_RAISON","DESTINATAIRE_AVISE_NON_RECLAME",
  "DEMENAGE","MAUVAISE_ADRESSE","MAUVAIS_PAYS_DESTINATION","MAUVAIS_FOURNISSEUR",
  "INVERSION_ETIQUETTES","ANNULATION_TRANSPORT","AUTRE"] as const;
const RESPS  = ["RECOURS","EXPLEO","VEOLIA","INTERNE_RPIC","CAR","TRANSPORTEUR","NON_DEFINIE"] as const;
const TRANS  = ["DHL","TRANS","AUTRE"] as const;
export const CreateRetourSchema = z.object({
  expeditionId: z.string().uuid().optional(),
  numeroExpeditionOrigine: z.string().optional(),
  transporteurOrigine: z.enum(TRANS).optional(),
  dateRetour: z.string().datetime(),
  heureRetour: z.string().datetime().optional(),
  nitg: z.string().length(4).optional(), vin: z.string().optional(),
  designationPiece: z.string().optional(), naturePiece: z.string().optional(),
  refPieceCause: z.string().length(10).optional(),
  typePiece: z.enum(["RC","IC"]).optional(),
  fournisseurId: z.string().uuid().optional(), nomFournisseur: z.string().optional(),
  numeroRegroupement: z.string().optional(),
  motifDisponible: z.boolean().default(true),
  causeRetour: z.enum(CAUSES).optional(),
  categorieProbleme: z.string().optional(), identificationCause: z.string().optional(),
  responsabilite: z.enum(RESPS).default("NON_DEFINIE"),
  actionCorrective: z.string().optional(),
  numeroNouvelleExp: z.string().optional(),
  transporteurReexpedition: z.enum(TRANS).optional(),
  dateNouvelleExp: z.string().datetime().optional(),
  dateArriveeNouvelleExp: z.string().datetime().optional(),
  reexpeditionReussie: z.boolean().optional(),
  commentaire: z.string().optional(),
});
export const UpdateRetourSchema = CreateRetourSchema.partial();
export type CreateRetourDto = z.infer<typeof CreateRetourSchema>;
export type UpdateRetourDto = z.infer<typeof UpdateRetourSchema>;
