import { prisma } from "@/lib/prisma";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { pagination, meta } from "@/lib/response";
import type { CreatePiloteDto, UpdatePiloteDto } from "@/validators/pilote.validator";

export class PiloteService {
  static async findAll(sp:URLSearchParams) {
    const { page,limit,skip } = pagination(sp);
    const type    = sp.get("type") as "RC"|"IC"|null;
    const isActif = sp.get("isActif");
    const search  = sp.get("search")||undefined;
    const where   = {
      ...(type    && { type }),
      ...(isActif!==null && { isActif:isActif==="true" }),
      ...(search  && { OR:[{code:{contains:search}},{nom:{contains:search,mode:"insensitive" as const}},{categorieGeree:{contains:search,mode:"insensitive" as const}}] }),
    };
    const [data,total] = await Promise.all([
      prisma.pilote.findMany({ where, include:{fournisseur:{select:{id:true,nom:true}},user:{select:{id:true,nom:true,prenom:true}}},
        orderBy:{code:"asc"}, skip, take:limit }),
      prisma.pilote.count({ where }),
    ]);
    return { data, meta:meta(total,page,limit) };
  }
  static async findById(id:string) {
    const p = await prisma.pilote.findUnique({ where:{id}, include:{ fournisseur:true,
      user:{select:{id:true,nom:true,prenom:true,email:true}}, _count:{select:{triages:true,expeditions:true}} } });
    if (!p) throw new NotFoundError("Pilote");
    return p;
  }
  static async create(dto:CreatePiloteDto) {
    const code = dto.code.toUpperCase();
    if (await prisma.pilote.findUnique({where:{code}})) throw new ConflictError("Code pilote déjà utilisé");
    return prisma.pilote.create({ data:{...dto,code} });
  }
  static async update(id:string, dto:UpdatePiloteDto) {
    if (!await prisma.pilote.findUnique({where:{id}})) throw new NotFoundError("Pilote");
    return prisma.pilote.update({ where:{id}, data:dto });
  }
  static async delete(id:string) {
    if (!await prisma.pilote.findUnique({where:{id}})) throw new NotFoundError("Pilote");
    return prisma.pilote.delete({ where:{id} });
  }
}
