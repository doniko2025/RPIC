import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import { pagination, meta } from "@/lib/response";
import { AuditService } from "./audit.service";
import type { CreateExpDto, UpdateExpDto } from "@/validators/expedition.validator";

const INC = {
  fournisseur:{ select:{id:true,nom:true} },
  siteExpedition:{ select:{id:true,nom:true,code6Plus2:true} },
  garageDestination:{ select:{id:true,nom:true,ville:true} },
  expediteur:{ select:{id:true,nom:true,prenom:true} },
  pilote:{ select:{id:true,code:true} },
  retour:{ select:{id:true,statut:true,dateRetour:true} },
};

export class ExpeditionService {
  static async findAll(sp:URLSearchParams) {
    const { page,limit,skip } = pagination(sp);
    const where:Record<string,unknown> = {};
    if (sp.get("transporteur")) where.transporteur = sp.get("transporteur");
    if (sp.get("typePiece"))    where.typePiece    = sp.get("typePiece");
    if (sp.get("statut"))       where.statut       = sp.get("statut");
    if (sp.get("fournisseurId"))where.fournisseurId= sp.get("fournisseurId");
    if (sp.get("search")) {
      const s = sp.get("search")!;
      where.OR = [{numeroExpedition:{contains:s}},{nitg:{contains:s.toUpperCase()}},{designationPiece:{contains:s,mode:"insensitive"}}];
    }
    if (sp.get("dateDebut")||sp.get("dateFin"))
      where.dateExpedition = { ...(sp.get("dateDebut")&&{gte:new Date(sp.get("dateDebut")!)}), ...(sp.get("dateFin")&&{lte:new Date(sp.get("dateFin")!)}) };
    const [data,total] = await Promise.all([
      prisma.expedition.findMany({ where, include:INC, orderBy:{dateExpedition:"desc"}, skip, take:limit }),
      prisma.expedition.count({ where }),
    ]);
    return { data, meta:meta(total,page,limit) };
  }
  static async findById(id:string) {
    const e = await prisma.expedition.findUnique({ where:{id}, include:{...INC,triage:true} });
    if (!e) throw new NotFoundError("Expédition");
    return e;
  }
  static async create(dto:CreateExpDto, userId:string) {
    const exp = await prisma.expedition.create({ data:{
      ...dto, expediteurId:userId, dateExpedition:new Date(dto.dateExpedition),
      heureExpedition:dto.heureExpedition ? new Date(dto.heureExpedition):undefined,
    }, include:INC });
    // Clôture alerte RC liée si triage RC
    if (exp.triage) {
      await prisma.pieceTriage.update({ where:{id:exp.triage.id}, data:{statutRC:"EXPEDIE"} });
      await prisma.alerteRC.updateMany({ where:{triageId:exp.triage.id,statut:"ACTIVE"}, data:{statut:"RESOLUE",traiteeAt:new Date()} });
    }
    await AuditService.log({ action:"EXP_CREATE",entite:"Expedition",entiteId:exp.id, details:`${exp.transporteur} — ${exp.numeroExpedition}`,userId });
    return exp;
  }
  static async update(id:string, dto:UpdateExpDto) {
    if (!await prisma.expedition.findUnique({where:{id}})) throw new NotFoundError("Expédition");
    return prisma.expedition.update({ where:{id}, data:dto, include:INC });
  }
  static async confirmerArrivee(id:string) {
    if (!await prisma.expedition.findUnique({where:{id}})) throw new NotFoundError("Expédition");
    return prisma.expedition.update({ where:{id}, data:{statut:"ARRIVE",dateArriveeConfirmee:new Date()}, include:INC });
  }
  static async delete(id:string) {
    if (!await prisma.expedition.findUnique({where:{id}})) throw new NotFoundError("Expédition");
    return prisma.expedition.delete({ where:{id} });
  }
}
