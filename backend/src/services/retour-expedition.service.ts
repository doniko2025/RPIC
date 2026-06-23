//backend/src/services/retour-expedition.service.ts
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import { pagination, meta } from "@/lib/response";
import { NotificationService } from "./notification.service";
import { sendMail, tpl } from "@/lib/mail";
import { logger } from "@/lib/logger";
import type { CreateRetourDto, UpdateRetourDto } from "@/validators/retour-expedition.validator";

export class RetourExpeditionService {
  static async findAll(sp:URLSearchParams) {
    const { page,limit,skip } = pagination(sp);
    const where:Record<string,unknown> = {};
    if (sp.get("transporteurOrigine")) where.transporteurOrigine = sp.get("transporteurOrigine");
    if (sp.get("estTraite")!==null)    where.estTraite = sp.get("estTraite")==="true";
    if (sp.get("fournisseurId"))       where.fournisseurId = sp.get("fournisseurId");
    const [data,total] = await Promise.all([
      prisma.retourExpedition.findMany({ where, include:{
        expedition:{select:{transporteur:true,numeroExpedition:true}},
        fournisseur:{select:{nom:true}}, recepteur:{select:{nom:true,prenom:true}},
      }, orderBy:{dateRetour:"desc"}, skip, take:limit }),
      prisma.retourExpedition.count({ where }),
    ]);
    return { data, meta:meta(total,page,limit) };
  }
  static async findById(id:string) {
    const r = await prisma.retourExpedition.findUnique({ where:{id}, include:{expedition:true,fournisseur:true,recepteur:{select:{nom:true,prenom:true,email:true}}} });
    if (!r) throw new NotFoundError("Retour expédition");
    return r;
  }
  static async create(dto:CreateRetourDto, recepteurId:string) {
    const sansmotif = !dto.motifDisponible || dto.causeRetour==="NON_COMMUNIQUE";
    const retour = await prisma.retourExpedition.create({ data:{
      ...dto, recepteurId, dateRetour:new Date(dto.dateRetour),
      motifDisponible: dto.motifDisponible ?? true,
      causeRetour: dto.causeRetour ?? (sansmotif ? "NON_COMMUNIQUE" : undefined),
      alerteTransGeneree: dto.transporteurOrigine==="TRANS" && sansmotif,
    }});
    if (dto.expeditionId)
      await prisma.expedition.update({ where:{id:dto.expeditionId}, data:{statut:"RETOURNE"} });
    if (dto.transporteurOrigine==="TRANS" && sansmotif) {
      await NotificationService.create({ userId:recepteurId, type:"RETOUR_TRANS_SANS_MOTIF",
        titre:`Retour TRANS — ${dto.nitg??""}`,
        message:`Expédition ${dto.numeroExpeditionOrigine??""} retournée par TRANS sans motif. Réexpédition DHL recommandée.`,
        lienAction:`/retours/${retour.id}` });
      const u = await prisma.user.findUnique({ where:{id:recepteurId}, select:{email:true} });
      if (u) {
        const t = tpl.retourTRANS({ nitg:dto.nitg??"-", num:dto.numeroExpeditionOrigine??retour.id });
        await sendMail({ to:u.email, subject:t.subject, html:t.html }).catch(e=>logger.error("mail retour TRANS",e));
      }
    }
    return retour;
  }
  static async update(id:string, dto:UpdateRetourDto) {
    if (!await prisma.retourExpedition.findUnique({where:{id}})) throw new NotFoundError("Retour expédition");
    return prisma.retourExpedition.update({ where:{id}, data:dto });
  }
  static async traiter(id:string) {
    if (!await prisma.retourExpedition.findUnique({where:{id}})) throw new NotFoundError("Retour expédition");
    return prisma.retourExpedition.update({ where:{id}, data:{estTraite:true,dateTraitement:new Date()} });
  }
  static async delete(id:string) {
    if (!await prisma.retourExpedition.findUnique({where:{id}})) throw new NotFoundError("Retour expédition");
    return prisma.retourExpedition.delete({ where:{id} });
  }
}
