-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "TypeBenne" AS ENUM ('PETITES_PIECES', 'PIECES_VOLUMINEUSES');

-- CreateEnum
CREATE TYPE "TypePiece" AS ENUM ('RC', 'IC');

-- CreateEnum
CREATE TYPE "StatutPieceRC" AS ENUM ('EN_ATTENTE_EXPEDITION', 'EXPEDIE', 'DEPASSEMENT_DELAI', 'CLOTURE');

-- CreateEnum
CREATE TYPE "StatutPieceIC" AS ENUM ('EN_KARDEX', 'EN_ANALYSE', 'A_REEXPEDIER', 'REEXPEDIE', 'CAFFUTE');

-- CreateEnum
CREATE TYPE "TypeRangement" AS ENUM ('PETITE_BOITE_RC', 'KARDEX_IC', 'AUTRE');

-- CreateEnum
CREATE TYPE "StatutCorrespondance" AS ENUM ('PROPOSEE', 'CONFIRMEE', 'EN_CONFLIT', 'OBSOLETE');

-- CreateEnum
CREATE TYPE "Transporteur" AS ENUM ('DHL', 'TRANS', 'AUTRE');

-- CreateEnum
CREATE TYPE "StatutConge" AS ENUM ('EN_ATTENTE', 'VU');

-- CreateEnum
CREATE TYPE "StatutAnomalie" AS ENUM ('A_TRAITER', 'EN_COURS', 'RESOLU', 'IMPOSSIBLE');

-- CreateEnum
CREATE TYPE "StatutTriImpossible" AS ENUM ('OUVERT', 'EN_COURS', 'RESOLU', 'BASCULE_TCR', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "CategorieProbleme" AS ENUM ('AUCUNE_DEDUCTION_RPIC', 'EXPEDITION_IMPOSSIBLE', 'RECEPTION_IMPOSSIBLE', 'MAUVAISE_DEDUCTION_SET', 'SET_INTROUVABLE', 'NIS_INCONNU', 'INACTIF_RPIC_6PLUS2_NON_PROPOSE', 'SET_NON_ACTIF', 'TRANSFERT_IMPOSSIBLE', 'BASCULE_TCR', 'AUTRE');

-- CreateEnum
CREATE TYPE "StatutExpedition" AS ENUM ('EXPEDIE', 'ARRIVE', 'RETOURNE', 'REFUSE', 'EN_ATTENTE', 'ANNULE');

-- CreateEnum
CREATE TYPE "CauseRetour" AS ENUM ('NON_COMMUNIQUE', 'RETOUR_SANS_RAISON', 'DESTINATAIRE_AVISE_NON_RECLAME', 'DEMENAGE', 'MAUVAISE_ADRESSE', 'MAUVAIS_PAYS_DESTINATION', 'MAUVAIS_FOURNISSEUR', 'INVERSION_ETIQUETTES', 'ANNULATION_TRANSPORT', 'AUTRE');

-- CreateEnum
CREATE TYPE "ResponsabiliteRetour" AS ENUM ('RECOURS', 'EXPLEO', 'VEOLIA', 'INTERNE_RPIC', 'CAR', 'TRANSPORTEUR', 'NON_DEFINIE');

-- CreateEnum
CREATE TYPE "TypeFluxReception" AS ENUM ('DHL', 'TRANS', 'CHRONOPOST', 'TRANSPORT_STANDARD', 'AUTRE');

-- CreateEnum
CREATE TYPE "TypePieceLogistique" AS ENUM ('MOTEUR', 'BOITE_VITESSE');

-- CreateEnum
CREATE TYPE "TypeNotification" AS ENUM ('ANOMALIE_SIGNALEE', 'COMMENTAIRE_AJOUTE', 'ACTION_CORRECTIVE_AJOUTEE', 'CONGE_SOUMIS', 'PIECE_TRI_IMPOSSIBLE_SIGNALEE', 'RETOUR_EXPEDITION_RECU', 'MENTION_LEGALE_A_ACCEPTER', 'ALERTE_DELAI_RC', 'DEPASSEMENT_DELAI_RC', 'RETOUR_TRANS_SANS_MOTIF', 'PIECE_REEXPEDIEE', 'CAFFUTAGE_EFFECTUE', 'CORRESPONDANCE_EN_CONFLIT', 'SYSTEME');

-- CreateEnum
CREATE TYPE "StatutMailLog" AS ENUM ('ENVOYE', 'ECHEC', 'EN_ATTENTE');

-- CreateEnum
CREATE TYPE "StatutAlerteRC" AS ENUM ('ACTIVE', 'RESOLUE', 'IGNOREE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
    "matricule" TEXT,
    "adresseLigne1" TEXT,
    "adresseLigne2" TEXT,
    "codePostal" TEXT,
    "ville" TEXT,
    "pays" TEXT NOT NULL DEFAULT 'France',
    "lieuTravail" TEXT NOT NULL,
    "poste" TEXT,
    "typePrincipal" "TypePiece",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIp" TEXT,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "acceptedRgpdAt" TIMESTAMP(3),
    "rgpdVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "ipAdresse" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fournisseur" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "codeInterne" TEXT,
    "adresseRetourLigne1" TEXT,
    "adresseRetourLigne2" TEXT,
    "codePostalRetour" TEXT,
    "villeRetour" TEXT,
    "paysRetour" TEXT NOT NULL DEFAULT 'France',
    "contactNom" TEXT,
    "contactEmail" TEXT,
    "contactTelephone" TEXT,
    "delaiExpeMaxRC" INTEGER NOT NULL DEFAULT 7,
    "isActif" BOOLEAN NOT NULL DEFAULT true,
    "commentaire" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fournisseur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteExpedition" (
    "id" TEXT NOT NULL,
    "code6Plus2" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "adresseLigne1" TEXT,
    "adresseLigne2" TEXT,
    "codePostal" TEXT,
    "ville" TEXT,
    "pays" TEXT NOT NULL DEFAULT 'France',
    "fournisseurId" TEXT,
    "isActif" BOOLEAN NOT NULL DEFAULT true,
    "commentaire" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteExpedition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pilote" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "TypePiece" NOT NULL,
    "nom" TEXT,
    "prenom" TEXT,
    "userId" TEXT,
    "fournisseurId" TEXT,
    "categorieGeree" TEXT,
    "emplacementKardex" TEXT,
    "isActif" BOOLEAN NOT NULL DEFAULT true,
    "commentaire" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pilote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Garage" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "codeGarage" TEXT,
    "adresseLigne1" TEXT,
    "adresseLigne2" TEXT,
    "codePostal" TEXT,
    "ville" TEXT,
    "pays" TEXT NOT NULL DEFAULT 'France',
    "contactNom" TEXT,
    "contactEmail" TEXT,
    "contactTelephone" TEXT,
    "isActif" BOOLEAN NOT NULL DEFAULT true,
    "commentaire" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Garage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Set" (
    "id" TEXT NOT NULL,
    "libelle" TEXT,
    "siteExpeditionId" TEXT,
    "destAdresseLigne1" TEXT,
    "destAdresseLigne2" TEXT,
    "destCodePostal" TEXT,
    "destVille" TEXT,
    "destPays" TEXT NOT NULL DEFAULT 'France',
    "demandeurNom" TEXT,
    "demandeurPrenom" TEXT,
    "demandeurEmail" TEXT,
    "demandeurTelephone" TEXT,
    "isActif" BOOLEAN NOT NULL DEFAULT true,
    "commentaire" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Set_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferencePiece" (
    "id" TEXT NOT NULL,
    "nitg" TEXT NOT NULL,
    "nis" TEXT,
    "refPieceCause" TEXT NOT NULL,
    "typePiece" "TypePiece" NOT NULL,
    "nomPiece" TEXT NOT NULL,
    "codeRef6Plus2" TEXT,
    "fournisseurId" TEXT,
    "fournisseurLibre" TEXT,
    "photo1" TEXT,
    "photo2" TEXT,
    "photo3" TEXT,
    "photo4" TEXT,
    "inscriptionSurPiece" TEXT,
    "conclusionDeTri" TEXT,
    "isActifRpic" BOOLEAN NOT NULL DEFAULT true,
    "commentaireTri" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferencePiece_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorrespondanceSet" (
    "id" TEXT NOT NULL,
    "cleUnique" TEXT NOT NULL,
    "nitg" TEXT NOT NULL,
    "refPieceCause" TEXT NOT NULL,
    "projetVehicule" TEXT,
    "indiceVehicule" TEXT,
    "projetMoteur" TEXT,
    "indiceMoteur" TEXT,
    "projetBoite" TEXT,
    "indiceBoite" TEXT,
    "typePiece" "TypePiece" NOT NULL,
    "setId" TEXT NOT NULL,
    "siteExpeditionId" TEXT,
    "fournisseurId" TEXT,
    "codeRef6Plus2" TEXT,
    "referencePieceId" TEXT,
    "statut" "StatutCorrespondance" NOT NULL DEFAULT 'PROPOSEE',
    "nbConfirmations" INTEGER NOT NULL DEFAULT 1,
    "nbInfirmations" INTEGER NOT NULL DEFAULT 0,
    "derniereConfirmationAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmeeParPiloteId" TEXT,
    "confirmeeAt" TIMESTAMP(3),
    "creeeParId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CorrespondanceSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorrespondanceSetConflit" (
    "id" TEXT NOT NULL,
    "correspondanceId" TEXT NOT NULL,
    "setAttendu" TEXT NOT NULL,
    "setObserve" TEXT NOT NULL,
    "signaleParId" TEXT,
    "resolu" BOOLEAN NOT NULL DEFAULT false,
    "noteResolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CorrespondanceSetConflit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PieceTriage" (
    "id" TEXT NOT NULL,
    "vin" TEXT,
    "nis" TEXT,
    "dateFabrication" TIMESTAMP(3),
    "dateLivraison" TIMESTAMP(3),
    "nitgSaisi" TEXT NOT NULL,
    "refPieceCauseSaisie" TEXT,
    "projetVehicule" TEXT,
    "indiceVehicule" TEXT,
    "projetMoteur" TEXT,
    "indiceMoteur" TEXT,
    "projetBoite" TEXT,
    "indiceBoite" TEXT,
    "codeRef6Plus2" TEXT,
    "nomPiece" TEXT,
    "typePiece" "TypePiece" NOT NULL,
    "numOR" TEXT,
    "dateOR" TIMESTAMP(3),
    "mr" INTEGER,
    "km" INTEGER,
    "verbatimClient" TEXT,
    "diagReparateur" TEXT,
    "conclusionTri" TEXT,
    "referencePieceId" TEXT,
    "correspondanceSetId" TEXT,
    "setId" TEXT,
    "siteExpeditionId" TEXT,
    "fournisseurId" TEXT,
    "garageOrigineId" TEXT,
    "piloteId" TEXT,
    "typeRangement" "TypeRangement",
    "emplacement" TEXT,
    "dateTri" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agentTriId" TEXT NOT NULL,
    "dateMaxExpeditionRC" TIMESTAMP(3),
    "statutRC" "StatutPieceRC",
    "statutIC" "StatutPieceIC",
    "caffute" BOOLEAN NOT NULL DEFAULT false,
    "caffutageMotif" TEXT,
    "caffuteParUserId" TEXT,
    "caffuteAt" TIMESTAMP(3),
    "photoTri1" TEXT,
    "photoTri2" TEXT,
    "photoTri3" TEXT,
    "photoTri4" TEXT,
    "expeditionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PieceTriage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlerteRC" (
    "id" TEXT NOT NULL,
    "triageId" TEXT NOT NULL,
    "fournisseurId" TEXT,
    "dateTri" TIMESTAMP(3) NOT NULL,
    "dateMaxExpedition" TIMESTAMP(3) NOT NULL,
    "joursDepuisTri" INTEGER,
    "joursRestants" INTEGER,
    "statut" "StatutAlerteRC" NOT NULL DEFAULT 'ACTIVE',
    "traiteeParId" TEXT,
    "traiteeAt" TIMESTAMP(3),
    "noteResolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlerteRC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PieceTriImpossible" (
    "id" TEXT NOT NULL,
    "dateConstat" TIMESTAMP(3) NOT NULL,
    "vin" TEXT,
    "nis" TEXT,
    "nitg" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "refPieceCause" TEXT,
    "inscriptionSurPiece" TEXT,
    "codeRef6Plus2" TEXT,
    "setIdentifie" TEXT,
    "typePiece" "TypePiece",
    "agentResponsable" TEXT NOT NULL,
    "problemeTri" BOOLEAN NOT NULL DEFAULT false,
    "problemeExpedition" BOOLEAN NOT NULL DEFAULT false,
    "categorieProbleme" "CategorieProbleme" NOT NULL DEFAULT 'AUCUNE_DEDUCTION_RPIC',
    "descriptionProbleme" TEXT NOT NULL,
    "inactifRpic6Plus2" BOOLEAN NOT NULL DEFAULT false,
    "basculerTCR" BOOLEAN NOT NULL DEFAULT false,
    "photo1" TEXT,
    "photo2" TEXT,
    "photo3" TEXT,
    "photo4" TEXT,
    "statut" "StatutTriImpossible" NOT NULL DEFAULT 'OUVERT',
    "actionCorrective" TEXT,
    "dateResolution" TIMESTAMP(3),
    "signaleurId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PieceTriImpossible_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentaireTriImpossible" (
    "id" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "pieceTriImpossibleId" TEXT NOT NULL,
    "auteurId" TEXT NOT NULL,
    "auteurNom" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentaireTriImpossible_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anomalie" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "vin" TEXT,
    "nitg" TEXT,
    "refPieceCause" TEXT,
    "typePiece" "TypePiece",
    "photo1" TEXT,
    "photo2" TEXT,
    "photo3" TEXT,
    "photo4" TEXT,
    "statut" "StatutAnomalie" NOT NULL DEFAULT 'A_TRAITER',
    "isDifficulteTri" BOOLEAN NOT NULL DEFAULT false,
    "signaleurId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Anomalie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionCorrective" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "anomalieId" TEXT NOT NULL,
    "executeurId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActionCorrective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commentaire" (
    "id" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "anomalieId" TEXT NOT NULL,
    "auteurId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Commentaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceptionLogistique" (
    "id" TEXT NOT NULL,
    "typeBenne" "TypeBenne" NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 1,
    "dateReception" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "typeFlux" "TypeFluxReception" NOT NULL DEFAULT 'TRANSPORT_STANDARD',
    "numeroBordereau" TEXT,
    "recepteurId" TEXT NOT NULL,
    "commentaire" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReceptionLogistique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expedition" (
    "id" TEXT NOT NULL,
    "numeroExpedition" TEXT NOT NULL,
    "transporteur" "Transporteur" NOT NULL DEFAULT 'DHL',
    "dateExpedition" TIMESTAMP(3) NOT NULL,
    "heureExpedition" TIMESTAMP(3),
    "nitg" TEXT,
    "vin" TEXT,
    "designationPiece" TEXT,
    "refPieceCause" TEXT,
    "typePiece" "TypePiece",
    "naturePiece" TEXT,
    "setId" TEXT,
    "siteExpeditionId" TEXT,
    "fournisseurId" TEXT,
    "garageDestinationId" TEXT,
    "piloteId" TEXT,
    "statut" "StatutExpedition" NOT NULL DEFAULT 'EXPEDIE',
    "dateArriveeConfirmee" TIMESTAMP(3),
    "expediteurId" TEXT NOT NULL,
    "commentaire" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expedition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetourExpedition" (
    "id" TEXT NOT NULL,
    "expeditionId" TEXT,
    "numeroExpeditionOrigine" TEXT,
    "transporteurOrigine" "Transporteur",
    "dateRetour" TIMESTAMP(3) NOT NULL,
    "heureRetour" TIMESTAMP(3),
    "nitg" TEXT,
    "designationPiece" TEXT,
    "naturePiece" TEXT,
    "vin" TEXT,
    "refPieceCause" TEXT,
    "typePiece" "TypePiece",
    "fournisseurId" TEXT,
    "nomFournisseur" TEXT,
    "numeroRegroupement" TEXT,
    "motifDisponible" BOOLEAN NOT NULL DEFAULT true,
    "causeRetour" "CauseRetour" DEFAULT 'NON_COMMUNIQUE',
    "categorieProbleme" TEXT,
    "identificationCause" TEXT,
    "responsabilite" "ResponsabiliteRetour" NOT NULL DEFAULT 'NON_DEFINIE',
    "actionCorrective" TEXT,
    "numeroNouvelleExp" TEXT,
    "transporteurReexpedition" "Transporteur",
    "dateNouvelleExp" TIMESTAMP(3),
    "dateArriveeNouvelleExp" TIMESTAMP(3),
    "reexpeditionReussie" BOOLEAN,
    "alerteTransGeneree" BOOLEAN NOT NULL DEFAULT false,
    "statut" "StatutExpedition" NOT NULL DEFAULT 'RETOURNE',
    "dateTraitement" TIMESTAMP(3),
    "estTraite" BOOLEAN NOT NULL DEFAULT false,
    "recepteurId" TEXT NOT NULL,
    "commentaire" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetourExpedition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PieceLogistique" (
    "id" TEXT NOT NULL,
    "typePiece" "TypePieceLogistique" NOT NULL,
    "quantite" INTEGER NOT NULL,
    "nitg" TEXT,
    "refPieceCause" TEXT,
    "vin" TEXT,
    "fournisseurId" TEXT,
    "fournisseurLibre" TEXT,
    "dateArrivee" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lieuStockage" TEXT,
    "typeFlux" "TypeFluxReception" NOT NULL DEFAULT 'TRANSPORT_STANDARD',
    "recepteurId" TEXT NOT NULL,
    "commentaire" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PieceLogistique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conge" (
    "id" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "motif" TEXT,
    "statut" "StatutConge" NOT NULL DEFAULT 'EN_ATTENTE',
    "noteAdmin" TEXT,
    "vuPar" TEXT,
    "vuLe" TIMESTAMP(3),
    "employeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "TypeNotification" NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "lienAction" TEXT,
    "metaData" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MailLog" (
    "id" TEXT NOT NULL,
    "destinataire" TEXT NOT NULL,
    "sujet" TEXT NOT NULL,
    "corps" TEXT NOT NULL,
    "statut" "StatutMailLog" NOT NULL DEFAULT 'EN_ATTENTE',
    "tentatives" INTEGER NOT NULL DEFAULT 0,
    "erreur" TEXT,
    "envoyeAt" TIMESTAMP(3),
    "contexte" TEXT,
    "entiteId" TEXT,
    "expediteurId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentionLegale" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentionLegale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entite" TEXT,
    "entiteId" TEXT,
    "details" TEXT NOT NULL,
    "anciennesValeurs" JSONB,
    "nouvellesValeurs" JSONB,
    "ipAdresse" TEXT,
    "userAgent" TEXT,
    "methodeHttp" TEXT,
    "endpoint" TEXT,
    "userId" TEXT,
    "userEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatistiqueJournaliere" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "nbPiecesTrieesRC" INTEGER NOT NULL DEFAULT 0,
    "nbPiecesTrieesIC" INTEGER NOT NULL DEFAULT 0,
    "nbPiecesTrieesTotal" INTEGER NOT NULL DEFAULT 0,
    "nbTriSetTrouveEnBase" INTEGER NOT NULL DEFAULT 0,
    "nbTriSetNonTrouve" INTEGER NOT NULL DEFAULT 0,
    "tauxAutoResolutionSet" DOUBLE PRECISION,
    "nbExpeditionsRC" INTEGER NOT NULL DEFAULT 0,
    "nbExpeditionsIC" INTEGER NOT NULL DEFAULT 0,
    "nbExpeditionsDHL" INTEGER NOT NULL DEFAULT 0,
    "nbExpeditionsTRANS" INTEGER NOT NULL DEFAULT 0,
    "nbRetours" INTEGER NOT NULL DEFAULT 0,
    "nbRetoursDHL" INTEGER NOT NULL DEFAULT 0,
    "nbRetoursTRANS" INTEGER NOT NULL DEFAULT 0,
    "nbReexpeditionsViaDHL" INTEGER NOT NULL DEFAULT 0,
    "nbReexpeditionsReussies" INTEGER NOT NULL DEFAULT 0,
    "nbPiecesCaffutees" INTEGER NOT NULL DEFAULT 0,
    "nbPiecesReexpediees" INTEGER NOT NULL DEFAULT 0,
    "nbRCDansDelai" INTEGER NOT NULL DEFAULT 0,
    "nbRCHorsDelai" INTEGER NOT NULL DEFAULT 0,
    "nbRCEnAlerte" INTEGER NOT NULL DEFAULT 0,
    "nbAnomaliesOuvertes" INTEGER NOT NULL DEFAULT 0,
    "nbAnomaliesResolues" INTEGER NOT NULL DEFAULT 0,
    "nbBennesPetitesPieces" INTEGER NOT NULL DEFAULT 0,
    "nbBennesPiecesVolumin" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatistiqueJournaliere_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_matricule_key" ON "User"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetPasswordToken_key" ON "User"("resetPasswordToken");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_lieuTravail_idx" ON "User"("lieuTravail");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Fournisseur_nom_key" ON "Fournisseur"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Fournisseur_codeInterne_key" ON "Fournisseur"("codeInterne");

-- CreateIndex
CREATE INDEX "Fournisseur_nom_idx" ON "Fournisseur"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "SiteExpedition_code6Plus2_key" ON "SiteExpedition"("code6Plus2");

-- CreateIndex
CREATE INDEX "SiteExpedition_code6Plus2_idx" ON "SiteExpedition"("code6Plus2");

-- CreateIndex
CREATE INDEX "SiteExpedition_nom_idx" ON "SiteExpedition"("nom");

-- CreateIndex
CREATE INDEX "SiteExpedition_fournisseurId_idx" ON "SiteExpedition"("fournisseurId");

-- CreateIndex
CREATE UNIQUE INDEX "Pilote_code_key" ON "Pilote"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Pilote_userId_key" ON "Pilote"("userId");

-- CreateIndex
CREATE INDEX "Pilote_code_idx" ON "Pilote"("code");

-- CreateIndex
CREATE INDEX "Pilote_type_idx" ON "Pilote"("type");

-- CreateIndex
CREATE INDEX "Pilote_fournisseurId_idx" ON "Pilote"("fournisseurId");

-- CreateIndex
CREATE UNIQUE INDEX "Garage_codeGarage_key" ON "Garage"("codeGarage");

-- CreateIndex
CREATE INDEX "Garage_nom_idx" ON "Garage"("nom");

-- CreateIndex
CREATE INDEX "Garage_codeGarage_idx" ON "Garage"("codeGarage");

-- CreateIndex
CREATE INDEX "Set_siteExpeditionId_idx" ON "Set"("siteExpeditionId");

-- CreateIndex
CREATE UNIQUE INDEX "ReferencePiece_refPieceCause_key" ON "ReferencePiece"("refPieceCause");

-- CreateIndex
CREATE INDEX "ReferencePiece_nitg_idx" ON "ReferencePiece"("nitg");

-- CreateIndex
CREATE INDEX "ReferencePiece_refPieceCause_idx" ON "ReferencePiece"("refPieceCause");

-- CreateIndex
CREATE INDEX "ReferencePiece_typePiece_idx" ON "ReferencePiece"("typePiece");

-- CreateIndex
CREATE INDEX "ReferencePiece_fournisseurId_idx" ON "ReferencePiece"("fournisseurId");

-- CreateIndex
CREATE INDEX "ReferencePiece_nitg_fournisseurId_idx" ON "ReferencePiece"("nitg", "fournisseurId");

-- CreateIndex
CREATE UNIQUE INDEX "CorrespondanceSet_cleUnique_key" ON "CorrespondanceSet"("cleUnique");

-- CreateIndex
CREATE INDEX "CorrespondanceSet_nitg_idx" ON "CorrespondanceSet"("nitg");

-- CreateIndex
CREATE INDEX "CorrespondanceSet_refPieceCause_idx" ON "CorrespondanceSet"("refPieceCause");

-- CreateIndex
CREATE INDEX "CorrespondanceSet_nitg_refPieceCause_idx" ON "CorrespondanceSet"("nitg", "refPieceCause");

-- CreateIndex
CREATE INDEX "CorrespondanceSet_typePiece_idx" ON "CorrespondanceSet"("typePiece");

-- CreateIndex
CREATE INDEX "CorrespondanceSet_statut_idx" ON "CorrespondanceSet"("statut");

-- CreateIndex
CREATE INDEX "CorrespondanceSet_setId_idx" ON "CorrespondanceSet"("setId");

-- CreateIndex
CREATE INDEX "CorrespondanceSet_fournisseurId_idx" ON "CorrespondanceSet"("fournisseurId");

-- CreateIndex
CREATE INDEX "CorrespondanceSet_siteExpeditionId_idx" ON "CorrespondanceSet"("siteExpeditionId");

-- CreateIndex
CREATE INDEX "CorrespondanceSet_referencePieceId_idx" ON "CorrespondanceSet"("referencePieceId");

-- CreateIndex
CREATE INDEX "CorrespondanceSetConflit_correspondanceId_idx" ON "CorrespondanceSetConflit"("correspondanceId");

-- CreateIndex
CREATE INDEX "CorrespondanceSetConflit_resolu_idx" ON "CorrespondanceSetConflit"("resolu");

-- CreateIndex
CREATE UNIQUE INDEX "PieceTriage_expeditionId_key" ON "PieceTriage"("expeditionId");

-- CreateIndex
CREATE INDEX "PieceTriage_nitgSaisi_idx" ON "PieceTriage"("nitgSaisi");

-- CreateIndex
CREATE INDEX "PieceTriage_refPieceCauseSaisie_idx" ON "PieceTriage"("refPieceCauseSaisie");

-- CreateIndex
CREATE INDEX "PieceTriage_nitgSaisi_refPieceCauseSaisie_idx" ON "PieceTriage"("nitgSaisi", "refPieceCauseSaisie");

-- CreateIndex
CREATE INDEX "PieceTriage_vin_idx" ON "PieceTriage"("vin");

-- CreateIndex
CREATE INDEX "PieceTriage_nis_idx" ON "PieceTriage"("nis");

-- CreateIndex
CREATE INDEX "PieceTriage_dateTri_idx" ON "PieceTriage"("dateTri");

-- CreateIndex
CREATE INDEX "PieceTriage_typePiece_idx" ON "PieceTriage"("typePiece");

-- CreateIndex
CREATE INDEX "PieceTriage_statutRC_idx" ON "PieceTriage"("statutRC");

-- CreateIndex
CREATE INDEX "PieceTriage_statutIC_idx" ON "PieceTriage"("statutIC");

-- CreateIndex
CREATE INDEX "PieceTriage_agentTriId_idx" ON "PieceTriage"("agentTriId");

-- CreateIndex
CREATE INDEX "PieceTriage_piloteId_idx" ON "PieceTriage"("piloteId");

-- CreateIndex
CREATE INDEX "PieceTriage_fournisseurId_idx" ON "PieceTriage"("fournisseurId");

-- CreateIndex
CREATE INDEX "PieceTriage_garageOrigineId_idx" ON "PieceTriage"("garageOrigineId");

-- CreateIndex
CREATE INDEX "PieceTriage_dateMaxExpeditionRC_idx" ON "PieceTriage"("dateMaxExpeditionRC");

-- CreateIndex
CREATE UNIQUE INDEX "AlerteRC_triageId_key" ON "AlerteRC"("triageId");

-- CreateIndex
CREATE INDEX "AlerteRC_statut_idx" ON "AlerteRC"("statut");

-- CreateIndex
CREATE INDEX "AlerteRC_dateMaxExpedition_idx" ON "AlerteRC"("dateMaxExpedition");

-- CreateIndex
CREATE INDEX "AlerteRC_dateTri_idx" ON "AlerteRC"("dateTri");

-- CreateIndex
CREATE INDEX "PieceTriImpossible_nitg_idx" ON "PieceTriImpossible"("nitg");

-- CreateIndex
CREATE INDEX "PieceTriImpossible_vin_idx" ON "PieceTriImpossible"("vin");

-- CreateIndex
CREATE INDEX "PieceTriImpossible_statut_idx" ON "PieceTriImpossible"("statut");

-- CreateIndex
CREATE INDEX "PieceTriImpossible_agentResponsable_idx" ON "PieceTriImpossible"("agentResponsable");

-- CreateIndex
CREATE INDEX "PieceTriImpossible_dateConstat_idx" ON "PieceTriImpossible"("dateConstat");

-- CreateIndex
CREATE INDEX "PieceTriImpossible_typePiece_idx" ON "PieceTriImpossible"("typePiece");

-- CreateIndex
CREATE INDEX "Anomalie_statut_idx" ON "Anomalie"("statut");

-- CreateIndex
CREATE INDEX "Anomalie_nitg_idx" ON "Anomalie"("nitg");

-- CreateIndex
CREATE INDEX "Anomalie_typePiece_idx" ON "Anomalie"("typePiece");

-- CreateIndex
CREATE UNIQUE INDEX "ActionCorrective_anomalieId_key" ON "ActionCorrective"("anomalieId");

-- CreateIndex
CREATE INDEX "ReceptionLogistique_dateReception_idx" ON "ReceptionLogistique"("dateReception");

-- CreateIndex
CREATE INDEX "ReceptionLogistique_typeBenne_idx" ON "ReceptionLogistique"("typeBenne");

-- CreateIndex
CREATE INDEX "ReceptionLogistique_typeFlux_idx" ON "ReceptionLogistique"("typeFlux");

-- CreateIndex
CREATE UNIQUE INDEX "Expedition_numeroExpedition_key" ON "Expedition"("numeroExpedition");

-- CreateIndex
CREATE INDEX "Expedition_numeroExpedition_idx" ON "Expedition"("numeroExpedition");

-- CreateIndex
CREATE INDEX "Expedition_transporteur_idx" ON "Expedition"("transporteur");

-- CreateIndex
CREATE INDEX "Expedition_nitg_idx" ON "Expedition"("nitg");

-- CreateIndex
CREATE INDEX "Expedition_statut_idx" ON "Expedition"("statut");

-- CreateIndex
CREATE INDEX "Expedition_dateExpedition_idx" ON "Expedition"("dateExpedition");

-- CreateIndex
CREATE INDEX "Expedition_typePiece_idx" ON "Expedition"("typePiece");

-- CreateIndex
CREATE INDEX "Expedition_fournisseurId_idx" ON "Expedition"("fournisseurId");

-- CreateIndex
CREATE INDEX "Expedition_garageDestinationId_idx" ON "Expedition"("garageDestinationId");

-- CreateIndex
CREATE INDEX "Expedition_piloteId_idx" ON "Expedition"("piloteId");

-- CreateIndex
CREATE UNIQUE INDEX "RetourExpedition_expeditionId_key" ON "RetourExpedition"("expeditionId");

-- CreateIndex
CREATE INDEX "RetourExpedition_dateRetour_idx" ON "RetourExpedition"("dateRetour");

-- CreateIndex
CREATE INDEX "RetourExpedition_causeRetour_idx" ON "RetourExpedition"("causeRetour");

-- CreateIndex
CREATE INDEX "RetourExpedition_statut_idx" ON "RetourExpedition"("statut");

-- CreateIndex
CREATE INDEX "RetourExpedition_nomFournisseur_idx" ON "RetourExpedition"("nomFournisseur");

-- CreateIndex
CREATE INDEX "RetourExpedition_fournisseurId_idx" ON "RetourExpedition"("fournisseurId");

-- CreateIndex
CREATE INDEX "RetourExpedition_nitg_idx" ON "RetourExpedition"("nitg");

-- CreateIndex
CREATE INDEX "RetourExpedition_typePiece_idx" ON "RetourExpedition"("typePiece");

-- CreateIndex
CREATE INDEX "RetourExpedition_transporteurOrigine_idx" ON "RetourExpedition"("transporteurOrigine");

-- CreateIndex
CREATE INDEX "PieceLogistique_typePiece_idx" ON "PieceLogistique"("typePiece");

-- CreateIndex
CREATE INDEX "PieceLogistique_dateArrivee_idx" ON "PieceLogistique"("dateArrivee");

-- CreateIndex
CREATE INDEX "PieceLogistique_fournisseurId_idx" ON "PieceLogistique"("fournisseurId");

-- CreateIndex
CREATE INDEX "Conge_employeId_idx" ON "Conge"("employeId");

-- CreateIndex
CREATE INDEX "Conge_dateDebut_dateFin_idx" ON "Conge"("dateDebut", "dateFin");

-- CreateIndex
CREATE INDEX "Conge_statut_idx" ON "Conge"("statut");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "MailLog_statut_idx" ON "MailLog"("statut");

-- CreateIndex
CREATE INDEX "MailLog_destinataire_idx" ON "MailLog"("destinataire");

-- CreateIndex
CREATE UNIQUE INDEX "MentionLegale_version_key" ON "MentionLegale"("version");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entite_entiteId_idx" ON "AuditLog"("entite", "entiteId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StatistiqueJournaliere_date_key" ON "StatistiqueJournaliere"("date");

-- CreateIndex
CREATE INDEX "StatistiqueJournaliere_date_idx" ON "StatistiqueJournaliere"("date");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteExpedition" ADD CONSTRAINT "SiteExpedition_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "Fournisseur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pilote" ADD CONSTRAINT "Pilote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pilote" ADD CONSTRAINT "Pilote_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "Fournisseur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Set" ADD CONSTRAINT "Set_siteExpeditionId_fkey" FOREIGN KEY ("siteExpeditionId") REFERENCES "SiteExpedition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferencePiece" ADD CONSTRAINT "ReferencePiece_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "Fournisseur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrespondanceSet" ADD CONSTRAINT "CorrespondanceSet_setId_fkey" FOREIGN KEY ("setId") REFERENCES "Set"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrespondanceSet" ADD CONSTRAINT "CorrespondanceSet_siteExpeditionId_fkey" FOREIGN KEY ("siteExpeditionId") REFERENCES "SiteExpedition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrespondanceSet" ADD CONSTRAINT "CorrespondanceSet_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "Fournisseur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrespondanceSet" ADD CONSTRAINT "CorrespondanceSet_referencePieceId_fkey" FOREIGN KEY ("referencePieceId") REFERENCES "ReferencePiece"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrespondanceSet" ADD CONSTRAINT "CorrespondanceSet_confirmeeParPiloteId_fkey" FOREIGN KEY ("confirmeeParPiloteId") REFERENCES "Pilote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrespondanceSet" ADD CONSTRAINT "CorrespondanceSet_creeeParId_fkey" FOREIGN KEY ("creeeParId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrespondanceSetConflit" ADD CONSTRAINT "CorrespondanceSetConflit_correspondanceId_fkey" FOREIGN KEY ("correspondanceId") REFERENCES "CorrespondanceSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PieceTriage" ADD CONSTRAINT "PieceTriage_referencePieceId_fkey" FOREIGN KEY ("referencePieceId") REFERENCES "ReferencePiece"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PieceTriage" ADD CONSTRAINT "PieceTriage_correspondanceSetId_fkey" FOREIGN KEY ("correspondanceSetId") REFERENCES "CorrespondanceSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PieceTriage" ADD CONSTRAINT "PieceTriage_setId_fkey" FOREIGN KEY ("setId") REFERENCES "Set"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PieceTriage" ADD CONSTRAINT "PieceTriage_siteExpeditionId_fkey" FOREIGN KEY ("siteExpeditionId") REFERENCES "SiteExpedition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PieceTriage" ADD CONSTRAINT "PieceTriage_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "Fournisseur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PieceTriage" ADD CONSTRAINT "PieceTriage_garageOrigineId_fkey" FOREIGN KEY ("garageOrigineId") REFERENCES "Garage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PieceTriage" ADD CONSTRAINT "PieceTriage_piloteId_fkey" FOREIGN KEY ("piloteId") REFERENCES "Pilote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PieceTriage" ADD CONSTRAINT "PieceTriage_agentTriId_fkey" FOREIGN KEY ("agentTriId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PieceTriage" ADD CONSTRAINT "PieceTriage_caffuteParUserId_fkey" FOREIGN KEY ("caffuteParUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PieceTriage" ADD CONSTRAINT "PieceTriage_expeditionId_fkey" FOREIGN KEY ("expeditionId") REFERENCES "Expedition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlerteRC" ADD CONSTRAINT "AlerteRC_triageId_fkey" FOREIGN KEY ("triageId") REFERENCES "PieceTriage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlerteRC" ADD CONSTRAINT "AlerteRC_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "Fournisseur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlerteRC" ADD CONSTRAINT "AlerteRC_traiteeParId_fkey" FOREIGN KEY ("traiteeParId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PieceTriImpossible" ADD CONSTRAINT "PieceTriImpossible_signaleurId_fkey" FOREIGN KEY ("signaleurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentaireTriImpossible" ADD CONSTRAINT "CommentaireTriImpossible_pieceTriImpossibleId_fkey" FOREIGN KEY ("pieceTriImpossibleId") REFERENCES "PieceTriImpossible"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anomalie" ADD CONSTRAINT "Anomalie_signaleurId_fkey" FOREIGN KEY ("signaleurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionCorrective" ADD CONSTRAINT "ActionCorrective_anomalieId_fkey" FOREIGN KEY ("anomalieId") REFERENCES "Anomalie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionCorrective" ADD CONSTRAINT "ActionCorrective_executeurId_fkey" FOREIGN KEY ("executeurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commentaire" ADD CONSTRAINT "Commentaire_anomalieId_fkey" FOREIGN KEY ("anomalieId") REFERENCES "Anomalie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commentaire" ADD CONSTRAINT "Commentaire_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceptionLogistique" ADD CONSTRAINT "ReceptionLogistique_recepteurId_fkey" FOREIGN KEY ("recepteurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expedition" ADD CONSTRAINT "Expedition_setId_fkey" FOREIGN KEY ("setId") REFERENCES "Set"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expedition" ADD CONSTRAINT "Expedition_siteExpeditionId_fkey" FOREIGN KEY ("siteExpeditionId") REFERENCES "SiteExpedition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expedition" ADD CONSTRAINT "Expedition_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "Fournisseur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expedition" ADD CONSTRAINT "Expedition_garageDestinationId_fkey" FOREIGN KEY ("garageDestinationId") REFERENCES "Garage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expedition" ADD CONSTRAINT "Expedition_piloteId_fkey" FOREIGN KEY ("piloteId") REFERENCES "Pilote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expedition" ADD CONSTRAINT "Expedition_expediteurId_fkey" FOREIGN KEY ("expediteurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetourExpedition" ADD CONSTRAINT "RetourExpedition_expeditionId_fkey" FOREIGN KEY ("expeditionId") REFERENCES "Expedition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetourExpedition" ADD CONSTRAINT "RetourExpedition_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "Fournisseur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetourExpedition" ADD CONSTRAINT "RetourExpedition_recepteurId_fkey" FOREIGN KEY ("recepteurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PieceLogistique" ADD CONSTRAINT "PieceLogistique_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "Fournisseur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PieceLogistique" ADD CONSTRAINT "PieceLogistique_recepteurId_fkey" FOREIGN KEY ("recepteurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conge" ADD CONSTRAINT "Conge_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MailLog" ADD CONSTRAINT "MailLog_expediteurId_fkey" FOREIGN KEY ("expediteurId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
