import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import { pagination, meta } from "@/lib/response";
import { NotificationService } from "./notification.service";
import type { CreateCongeDto, UpdateCongeDto } from "@/validators/conge.validator";

export class CongeService {
  static async findAll(sp:URLSearchParams, viewerRole:string, viewerUserId:string) {
    const { page,limit,skip } = pagination(sp);
    const employeId = sp.get("employeId")||undefined;
    const statut    = sp.get("statut") as "EN_ATTENTE"|"VU"|undefined;
    const where:Record<string,unknown> = {
      ...(viewerRole==="EMPLOYEE" ? {employeId:viewerUserId} : (employeId && {employeId})),
      ...(statut && {statut}),
    };
    const [data,total] = await Promise.all([
      prisma.conge.findMany({ where, include:{employe:{select:{nom:true,prenom:true}}}, orderBy:{dateDebut:"desc"}, skip, take:limit }),
      prisma.conge.count({ where }),
    ]);
    return { data, meta:meta(total,page,limit) };
  }
  static async findById(id:string) {
    const c = await prisma.conge.findUnique({ where:{id}, include:{employe:{select:{nom:true,prenom:true}}} });
    if (!c) throw new NotFoundError("Congé");
    return c;
  }
  static async create(dto:CreateCongeDto, employeId:string) {
    const c = await prisma.conge.create({ data:{...dto,employeId,dateDebut:new Date(dto.dateDebut),dateFin:new Date(dto.dateFin)} });
    await NotificationService.notifyAdmins({ type:"CONGE_SOUMIS", titre:"Nouveau congé soumis",
      message:`Du ${dto.dateDebut.substring(0,10)} au ${dto.dateFin.substring(0,10)}`, lienAction:`/conges/${c.id}` });
    return c;
  }
  static async marquerVu(id:string, adminId:string, noteAdmin?:string) {
    if (!await prisma.conge.findUnique({where:{id}})) throw new NotFoundError("Congé");
    const admin = await prisma.user.findUnique({ where:{id:adminId}, select:{nom:true,prenom:true} });
    return prisma.conge.update({ where:{id}, data:{ statut:"VU", vuPar:admin?`${admin.prenom} ${admin.nom}`:adminId, vuLe:new Date(), noteAdmin } });
  }
  static async update(id:string, dto:UpdateCongeDto) {
    if (!await prisma.conge.findUnique({where:{id}})) throw new NotFoundError("Congé");
    return prisma.conge.update({ where:{id}, data:dto });
  }
  static async delete(id:string) {
    if (!await prisma.conge.findUnique({where:{id}})) throw new NotFoundError("Congé");
    return prisma.conge.delete({ where:{id} });
  }
}
