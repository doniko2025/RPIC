export const STATUT_RC_LABELS: Record<string, string> = {
  EN_ATTENTE_EXPEDITION: "En attente",
  EXPEDIE:               "Expédié",
  DEPASSEMENT_DELAI:     "Dépassement délai",
  CLOTURE:               "Clôturé",
};
export const STATUT_IC_LABELS: Record<string, string> = {
  EN_KARDEX:    "En Kardex",
  EN_ANALYSE:   "En analyse",
  A_REEXPEDIER: "À réexpédier",
  REEXPEDIE:    "Réexpédié",
  CAFFUTE:      "Caffuté",
};
export const STATUT_CORR_LABELS: Record<string, string> = {
  PROPOSEE:   "Proposée",
  CONFIRMEE:  "Confirmée",
  EN_CONFLIT: "En conflit",
  OBSOLETE:   "Obsolète",
};
export const TRANSPORTEUR_LABELS: Record<string, string> = {
  DHL: "DHL", TRANS: "TRANS", AUTRE: "Autre",
};
export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur", MANAGER: "Manager", EMPLOYEE: "Employé",
};
export const STATUT_ALERTE_LABELS: Record<string, string> = {
  ACTIVE: "Active", RESOLUE: "Résolue", IGNOREE: "Ignorée",
};
export const TYPE_PIECE_LABELS: Record<string, string> = {
  RC: "RC — Recours Comex", IC: "IC — Incidentologie",
};
export const CAUSE_RETOUR_LABELS: Record<string, string> = {
  NON_COMMUNIQUE:                  "Non communiqué",
  RETOUR_SANS_RAISON:              "Retour sans raison",
  DESTINATAIRE_AVISE_NON_RECLAME:  "Destinataire avisé, non réclamé",
  DEMENAGE:                        "Déménagé",
  MAUVAISE_ADRESSE:                "Mauvaise adresse",
  MAUVAIS_PAYS_DESTINATION:        "Mauvais pays",
  MAUVAIS_FOURNISSEUR:             "Mauvais fournisseur",
  INVERSION_ETIQUETTES:            "Inversion étiquettes",
  ANNULATION_TRANSPORT:            "Annulation transport",
  AUTRE:                           "Autre",
};
