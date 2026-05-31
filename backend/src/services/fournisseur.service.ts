import { prisma } from "@/lib/prisma";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { pagination, meta } from "@/lib/response";
import type { CreateFournisseurDto, UpdateFournisseurDto } from "@/validators/fournisseur.validator";

export class FournisseurService {
  static async findAll(sp:URLSearchParams) {
    const { page,limit,skip } = pagination(sp);
    const search  = sp.get("search")||undefined;
    const isActif = sp.get("isActif");
    const where   = {
      ...(search   && { nom:{contains:search,mode:"insensitive" as const} }),
      ...(isActif!==null && { isActif:isActif==="true" }),
    };
    const [data,total] = await Promise.all([
      prisma.fournisseur.findMany({ where, include:{_count:{select:{piecesReference:true,triages:true}}},
        orderBy:{nom:"asc"}, skip, take:limit }),
      prisma.fournisseur.count({ where }),
    ]);
    return { data, meta:meta(total,page,limit) };
  }
  static async findById(id:string) {
    const f = await prisma.fournisseur.findUnique({ where:{id}, include:{ sitesExpedition:true, pilotes:true,
      _count:{select:{piecesReference:true,triages:true,alertesRC:true}} } });
    if (!f) throw new NotFoundError("Fournisseur");
    return f;
  }
  static async create(dto:CreateFournisseurDto) {
    if (await prisma.fournisseur.findUnique({where:{nom:dto.nom}})) throw new ConflictError("Nom déjà utilisé");
    return prisma.fournisseur.create({ data:dto });
  }
  static async update(id:string, dto:UpdateFournisseurDto) {
    if (!await prisma.fournisseur.findUnique({where:{id}})) throw new NotFoundError("Fournisseur");
    return prisma.fournisseur.update({ where:{id}, data:dto });
  }
  static async delete(id:string) {
    const f = await prisma.fournisseur.findUnique({ where:{id}, include:{_count:{select:{triages:true}}} });
    if (!f) throw new NotFoundError("Fournisseur");
    if (f._count.triages>0) return prisma.fournisseur.update({ where:{id}, data:{isActif:false} });
    return prisma.fournisseur.delete({ where:{id} });
  }
}
