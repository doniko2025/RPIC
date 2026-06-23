/**
 * CRON alerte RC — à exécuter quotidiennement (ex: "0 7 * * *")
 * Détecte les pièces RC proches ou dépassant leur délai d'expédition.
 */
//backend/src/lib/cron/alerte-rc.ts
import cron from "node-cron";
import { prisma } from "@/lib/prisma";
import { joursRestants, formatDate } from "@/lib/utils"; // FIX : calcMax supprimé — importé mais jamais utilisé
import { sendMail, tpl } from "@/lib/mail";
import { logger } from "@/lib/logger";
import { ALERTE_RC_AVANT, DELAI_RC_DEFAULT } from "@/lib/constants";

export async function runAlerteRC() {
  logger.info("[CRON] alerteRC start");

  const triages = await prisma.pieceTriage.findMany({
    where: { typePiece:"RC", statutRC:"EN_ATTENTE_EXPEDITION", dateMaxExpeditionRC:{not:null} },
    include: {
      agentTri:    { select:{email:true,prenom:true} },
      fournisseur: { select:{delaiExpeMaxRC:true,nom:true} },
      pilote:      { select:{user:{select:{email:true}}} },
    },
  });

  logger.info(`[CRON] alerteRC — ${triages.length} pièces en attente`);

  for (const t of triages) {
    if (!t.dateMaxExpeditionRC) continue;
    const restants = joursRestants(t.dateMaxExpeditionRC);
    const delai    = t.fournisseur?.delaiExpeMaxRC ?? DELAI_RC_DEFAULT;
    const jours    = delai - restants;
    const nom      = t.nomPiece ?? t.nitgSaisi;
    const dateMax  = formatDate(t.dateMaxExpeditionRC);

    // Upsert alerte
    await prisma.alerteRC.upsert({
      where:  { triageId: t.id },
      update: { joursDepuisTri:jours, joursRestants:restants, updatedAt:new Date() },
      create: { triageId:t.id, fournisseurId:t.fournisseurId, dateTri:t.dateTri,
                dateMaxExpedition:t.dateMaxExpeditionRC, joursDepuisTri:jours,
                joursRestants:restants, statut:"ACTIVE" },
    });

    if (restants <= 0) {
      // Dépassement
      await prisma.pieceTriage.update({ where:{id:t.id}, data:{statutRC:"DEPASSEMENT_DELAI"} });
      await prisma.alerteRC.updateMany({ where:{triageId:t.id}, data:{statut:"ACTIVE"} });
      await prisma.notification.create({ data:{
        userId:t.agentTriId, type:"DEPASSEMENT_DELAI_RC",
        titre:`Dépassement RC — ${t.nitgSaisi}`,
        message:`${nom} a dépassé le délai. Date limite : ${dateMax}.`,
        lienAction:`/triages/${t.id}`,
      }});
      const tmpl = tpl.depassementRC({nom, nitg:t.nitgSaisi, dateMax, jours});
      await sendMail({to:t.agentTri.email, ...tmpl, contexte:"DEPASSEMENT_RC", entiteId:t.id}).catch(()=>{});
      if (t.pilote?.user?.email)
        await sendMail({to:t.pilote.user.email, ...tmpl, contexte:"DEPASSEMENT_RC", entiteId:t.id}).catch(()=>{});
    } else if (restants <= ALERTE_RC_AVANT) {
      // Alerte préventive
      const tmpl = tpl.alerteRC({nom, nitg:t.nitgSaisi, dateMax, restants});
      await sendMail({to:t.agentTri.email, ...tmpl, contexte:"ALERTE_RC", entiteId:t.id}).catch(()=>{});
    }
  }
  logger.info("[CRON] alerteRC done");
}

if (require.main===module) {
  cron.schedule("0 7 * * *", runAlerteRC);
  runAlerteRC().catch(e=>{ logger.error("[CRON] fatal",e); process.exit(1); });
}