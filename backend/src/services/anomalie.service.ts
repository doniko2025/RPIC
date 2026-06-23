//backend/src/services/anomalie.service.ts
import { prisma } from "@/lib/prisma";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { pagination, meta } from "@/lib/response";
import { NotificationService } from "./notification.service";
import type { CreateAnomalieDto, UpdateAnomalieDto } from "@/validators/anomalie.validator";

export class AnomalieService {
  static async findAll(sp:URLSearchParams) {
    const { page,limit,skip } = pagination(sp);
    const where:Record<string,unknown> = {};
    if (sp.get("statut"))   where.statut   = sp.get("statut");
    if (sp.get("typePiece"))where.typePiece= sp.get("typePiece");
    const [data,total] = await Promise.all([
      prisma.anomalie.findMany({ where, include:{signaleur:{select:{nom:true,prenom:true}},actionCorrective:{select:{id:true}},_count:{select:{commentaires:true}}}, orderBy:{createdAt:"desc"}, skip, take:limit }),
      prisma.anomalie.count({ where }),
    ]);
    return { data, meta:meta(total,page,limit) };
  }
  static async findById(id:string) {
    const a = await prisma.anomalie.findUnique({ where:{id}, include:{
      signaleur:{select:{nom:true,prenom:true}},
      actionCorrective:{include:{executeur:{select:{nom:true,prenom:true}}}},
      commentaires:{include:{auteur:{select:{nom:true,prenom:true}}},orderBy:{createdAt:"asc"}},
    }});
    if (!a) throw new NotFoundError("Anomalie");
    return a;
  }
  static async create(dto:CreateAnomalieDto, signaleurId:string) {
    const a = await prisma.anomalie.create({ data:{...dto,signaleurId} });
    await NotificationService.notifyAdmins({ type:"ANOMALIE_SIGNALEE", titre:`Anomalie — ${dto.titre}`,
      message:dto.description.substring(0,200), lienAction:`/anomalies/${a.id}` });
    return a;
  }
  static async update(id:string, dto:UpdateAnomalieDto) {
    if (!await prisma.anomalie.findUnique({where:{id}})) throw new NotFoundError("Anomalie");
    return prisma.anomalie.update({ where:{id}, data:dto });
  }
  static async addActionCorrective(anomalieId:string, description:string, executeurId:string) {
    if (!await prisma.anomalie.findUnique({where:{id:anomalieId}})) throw new NotFoundError("Anomalie");
    if (await prisma.actionCorrective.findUnique({where:{anomalieId}})) throw new ConflictError("Action corrective déjà existante");
    const ac = await prisma.actionCorrective.create({ data:{anomalieId,description,executeurId} });
    await prisma.anomalie.update({ where:{id:anomalieId}, data:{statut:"EN_COURS"} });
    return ac;
  }
  static async addCommentaire(anomalieId:string, contenu:string, auteurId:string) {
    if (!await prisma.anomalie.findUnique({where:{id:anomalieId}})) throw new NotFoundError("Anomalie");
    return prisma.commentaire.create({ data:{anomalieId,contenu,auteurId}, include:{auteur:{select:{nom:true,prenom:true}}} });
  }
  static async delete(id:string) {
    if (!await prisma.anomalie.findUnique({where:{id}})) throw new NotFoundError("Anomalie");
    return prisma.anomalie.delete({ where:{id} });
  }
}
