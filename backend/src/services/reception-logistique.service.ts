import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import { pagination, meta } from "@/lib/response";
import type { CreateReceptionDto, UpdateReceptionDto } from "@/validators/reception-logistique.validator";

export class ReceptionLogistiqueService {
  static async findAll(sp:URLSearchParams) {
    const { page,limit,skip } = pagination(sp);
    const where:Record<string,unknown> = {};
    if (sp.get("typeBenne")) where.typeBenne = sp.get("typeBenne");
    if (sp.get("typeFlux"))  where.typeFlux  = sp.get("typeFlux");
    if (sp.get("dateDebut")||sp.get("dateFin"))
      where.dateReception = { ...(sp.get("dateDebut")&&{gte:new Date(sp.get("dateDebut")!)}), ...(sp.get("dateFin")&&{lte:new Date(sp.get("dateFin")!)}) };
    const [data,total] = await Promise.all([
      prisma.receptionLogistique.findMany({ where, include:{recepteur:{select:{nom:true,prenom:true}}}, orderBy:{dateReception:"desc"}, skip, take:limit }),
      prisma.receptionLogistique.count({ where }),
    ]);
    return { data, meta:meta(total,page,limit) };
  }
  static async findById(id:string) {
    const r = await prisma.receptionLogistique.findUnique({ where:{id}, include:{recepteur:{select:{nom:true,prenom:true}}} });
    if (!r) throw new NotFoundError("Réception logistique");
    return r;
  }
  static async create(dto:CreateReceptionDto, recepteurId:string) {
    return prisma.receptionLogistique.create({ data:{...dto, recepteurId, dateReception:dto.dateReception?new Date(dto.dateReception):new Date()} });
  }
  static async update(id:string, dto:UpdateReceptionDto) {
    if (!await prisma.receptionLogistique.findUnique({where:{id}})) throw new NotFoundError("Réception logistique");
    return prisma.receptionLogistique.update({ where:{id}, data:dto });
  }
  static async delete(id:string) {
    if (!await prisma.receptionLogistique.findUnique({where:{id}})) throw new NotFoundError("Réception logistique");
    return prisma.receptionLogistique.delete({ where:{id} });
  }
}
