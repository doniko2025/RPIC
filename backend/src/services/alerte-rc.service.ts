import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import { pagination, meta } from "@/lib/response";

export class AlerteRCService {
  static async findAll(sp:URLSearchParams) {
    const { page,limit,skip } = pagination(sp);
    const statut = sp.get("statut") as "ACTIVE"|"RESOLUE"|"IGNOREE"|undefined;
    const fId    = sp.get("fournisseurId")||undefined;
    const where  = { ...(statut&&{statut}), ...(fId&&{fournisseurId:fId}) };
    const [data,total] = await Promise.all([
      prisma.alerteRC.findMany({ where, include:{
        triage:{ select:{ nitgSaisi:true,nomPiece:true,typePiece:true, agentTri:{select:{nom:true,prenom:true}} } },
        fournisseur:{ select:{nom:true} }, traiteePar:{ select:{nom:true,prenom:true} },
      }, orderBy:{joursRestants:"asc"}, skip, take:limit }),
      prisma.alerteRC.count({ where }),
    ]);
    return { data, meta:meta(total,page,limit) };
  }
  static async findById(id:string) {
    const a = await prisma.alerteRC.findUnique({ where:{id}, include:{triage:true,fournisseur:true,traiteePar:{select:{nom:true,prenom:true}}} });
    if (!a) throw new NotFoundError("Alerte RC");
    return a;
  }
  static async resoudre(id:string, userId:string, note?:string) {
    if (!await prisma.alerteRC.findUnique({where:{id}})) throw new NotFoundError("Alerte RC");
    return prisma.alerteRC.update({ where:{id}, data:{ statut:"RESOLUE", traiteeParId:userId, traiteeAt:new Date(), noteResolution:note } });
  }
  static async ignorer(id:string, userId:string, note?:string) {
    if (!await prisma.alerteRC.findUnique({where:{id}})) throw new NotFoundError("Alerte RC");
    return prisma.alerteRC.update({ where:{id}, data:{ statut:"IGNOREE", traiteeParId:userId, traiteeAt:new Date(), noteResolution:note } });
  }
  static countActive() { return prisma.alerteRC.count({ where:{statut:"ACTIVE"} }); }
}
