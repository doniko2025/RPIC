import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

export class StatsService {
  static async getDashboard() {
    const [trRC,trIC,expDHL,expTRANS,retours,retTRANS,alerteActive,depassement,
           anoOuv,caffutes,corrConfirm,corrConflit,pilotes] = await Promise.all([
      prisma.pieceTriage.count({ where:{typePiece:"RC"} }),
      prisma.pieceTriage.count({ where:{typePiece:"IC"} }),
      prisma.expedition.count({ where:{transporteur:"DHL"} }),
      prisma.expedition.count({ where:{transporteur:"TRANS"} }),
      prisma.retourExpedition.count(),
      prisma.retourExpedition.count({ where:{transporteurOrigine:"TRANS"} }),
      prisma.alerteRC.count({ where:{statut:"ACTIVE"} }),
      prisma.pieceTriage.count({ where:{statutRC:"DEPASSEMENT_DELAI"} }),
      prisma.anomalie.count({ where:{statut:{in:["A_TRAITER","EN_COURS"]}} }),
      prisma.pieceTriage.count({ where:{caffute:true} }),
      prisma.correspondanceSet.count({ where:{statut:"CONFIRMEE"} }),
      prisma.correspondanceSet.count({ where:{statut:"EN_CONFLIT"} }),
      prisma.pilote.count({ where:{isActif:true} }),
    ]);
    const totalTri = trRC+trIC; const totalExp = expDHL+expTRANS;
    return {
      triages:{ total:totalTri, rc:trRC, ic:trIC },
      expeditions:{ total:totalExp, dhl:expDHL, trans:expTRANS },
      retours:{ total:retours, trans:retTRANS, tauxTRANS:totalExp>0?Math.round(retTRANS/expTRANS*100):0 },
      alertesRC:{ actives:alerteActive, depassements:depassement },
      anomalies:{ ouvertes:anoOuv },
      ic:{ caffutes },
      referentiel:{ confirmees:corrConfirm, conflits:corrConflit },
      pilotes,
    };
  }

  static async getHistorique(sp:URLSearchParams) {
    const jours = Math.min(90, parseInt(sp.get("jours")||"30",10));
    const since = dayjs().subtract(jours,"day").startOf("day").toDate();
    return prisma.statistiqueJournaliere.findMany({
      where:{ date:{ gte:since } }, orderBy:{ date:"asc" },
    });
  }

  static async getJour(date:string) {
    const d = dayjs(date).startOf("day").toDate();
    return prisma.statistiqueJournaliere.findUnique({ where:{date:d} });
  }
}
