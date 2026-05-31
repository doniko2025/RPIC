import { prisma } from "@/lib/prisma";
import { pagination, meta } from "@/lib/response";
import { retryMails } from "@/lib/mail";

export class MailService {
  static async findAll(sp:URLSearchParams) {
    const { page,limit,skip } = pagination(sp);
    const statut = sp.get("statut") as "ENVOYE"|"ECHEC"|"EN_ATTENTE"|undefined;
    const where  = { ...(statut&&{statut}) };
    const [data,total] = await Promise.all([
      prisma.mailLog.findMany({ where, include:{expediteur:{select:{nom:true,prenom:true}}}, orderBy:{createdAt:"desc"}, skip, take:limit }),
      prisma.mailLog.count({ where }),
    ]);
    return { data, meta:meta(total,page,limit) };
  }
  static retry() { return retryMails(); }
}
