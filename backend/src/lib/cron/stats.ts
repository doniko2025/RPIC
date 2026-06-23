/**
 * CRON stats journalières — à exécuter à minuit ("0 0 * * *")
 */
//backend/src/lib/cron/stats.ts
import cron from "node-cron";
import dayjs from "dayjs";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function runStats(target?: Date) {
  const date    = dayjs(target ?? dayjs().subtract(1,"day")).startOf("day").toDate();
  const dateEnd = dayjs(date).endOf("day").toDate();
  logger.info(`[CRON] stats ${dayjs(date).format("YYYY-MM-DD")}`);

  const range = (field: "dateExpedition"|"dateRetour"|"dateReception"|"dateTri"|"dateArrivee"|"updatedAt"|"caffuteAt"|"createdAt") =>
    ({ [field]: { gte:date, lte:dateEnd } });

  const [trRC,trIC,expRC,expIC,expDHL,expTRANS,retTot,retDHL,retTRANS,reexpDHL,reexpOK,
         caffutes,reexpIC,rcDans,rcHors,rcAlerte,anoOuv,anoRes,benPP,benPV,setTrouves] =
  await Promise.all([
    prisma.pieceTriage.count({ where:{ typePiece:"RC", ...range("dateTri")} }),
    prisma.pieceTriage.count({ where:{ typePiece:"IC", ...range("dateTri")} }),
    prisma.expedition.count({  where:{ typePiece:"RC", ...range("dateExpedition")} }),
    prisma.expedition.count({  where:{ typePiece:"IC", ...range("dateExpedition")} }),
    prisma.expedition.count({  where:{ transporteur:"DHL", ...range("dateExpedition")} }),
    prisma.expedition.count({  where:{ transporteur:"TRANS", ...range("dateExpedition")} }),
    prisma.retourExpedition.count({ where:{ ...range("dateRetour")} }),
    prisma.retourExpedition.count({ where:{ transporteurOrigine:"DHL", ...range("dateRetour")} }),
    prisma.retourExpedition.count({ where:{ transporteurOrigine:"TRANS", ...range("dateRetour")} }),
    prisma.retourExpedition.count({ where:{ transporteurReexpedition:"DHL", ...range("dateRetour")} }),
    prisma.retourExpedition.count({ where:{ reexpeditionReussie:true, ...range("dateRetour")} }),
    prisma.pieceTriage.count({    where:{ caffute:true, ...range("caffuteAt")} }),
    prisma.pieceTriage.count({    where:{ statutIC:"REEXPEDIE", ...range("updatedAt")} }),
    prisma.pieceTriage.count({    where:{ typePiece:"RC", statutRC:"EXPEDIE", ...range("updatedAt")} }),
    prisma.pieceTriage.count({    where:{ typePiece:"RC", statutRC:"DEPASSEMENT_DELAI", ...range("updatedAt")} }),
    prisma.alerteRC.count({       where:{ statut:"ACTIVE"} }),
    prisma.anomalie.count({       where:{ statut:{in:["A_TRAITER","EN_COURS"]}, ...range("createdAt")} }),
    prisma.anomalie.count({       where:{ statut:"RESOLU", ...range("updatedAt")} }),
    prisma.receptionLogistique.count({ where:{ typeBenne:"PETITES_PIECES", ...range("dateReception")} }),
    prisma.receptionLogistique.count({ where:{ typeBenne:"PIECES_VOLUMINEUSES", ...range("dateReception")} }),
    prisma.pieceTriage.count({    where:{ correspondanceSetId:{not:null}, ...range("dateTri")} }),
  ]);

  const total = trRC + trIC;
  const setNon = total - setTrouves;
  const taux   = total > 0 ? Math.round((setTrouves/total)*100)/100 : null;

  const data = {
    nbPiecesTrieesRC:trRC, nbPiecesTrieesIC:trIC, nbPiecesTrieesTotal:total,
    nbTriSetTrouveEnBase:setTrouves, nbTriSetNonTrouve:setNon, tauxAutoResolutionSet:taux,
    nbExpeditionsRC:expRC, nbExpeditionsIC:expIC, nbExpeditionsDHL:expDHL, nbExpeditionsTRANS:expTRANS,
    nbRetours:retTot, nbRetoursDHL:retDHL, nbRetoursTRANS:retTRANS,
    nbReexpeditionsViaDHL:reexpDHL, nbReexpeditionsReussies:reexpOK,
    nbPiecesCaffutees:caffutes, nbPiecesReexpediees:reexpIC,
    nbRCDansDelai:rcDans, nbRCHorsDelai:rcHors, nbRCEnAlerte:rcAlerte,
    nbAnomaliesOuvertes:anoOuv, nbAnomaliesResolues:anoRes,
    nbBennesPetitesPieces:benPP, nbBennesPiecesVolumin:benPV,
  };

  await prisma.statistiqueJournaliere.upsert({ where:{date}, update:data, create:{date,...data} });
  logger.info(`[CRON] stats done`);
}

if (require.main===module) {
  cron.schedule("0 0 * * *", ()=>runStats());
  runStats().catch(e=>{ logger.error("[CRON] stats fatal",e); process.exit(1); });
}
