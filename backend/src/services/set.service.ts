//backend/src/services/set.service.ts
import { prisma } from "@/lib/prisma";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { pagination, meta } from "@/lib/response";
import type { CreateSetDto, UpdateSetDto } from "@/validators/set.validator";

export class SetService {
  static async findAll(sp:URLSearchParams) {
    const { page,limit,skip } = pagination(sp);
    const search = sp.get("search")||undefined;
    const where  = search ? { OR:[{id:{contains:search}},{libelle:{contains:search,mode:"insensitive" as const}}] } : {};
    const [data,total] = await Promise.all([
      prisma.set.findMany({ where, include:{siteExpedition:{include:{fournisseur:{select:{id:true,nom:true}}}}},
        orderBy:{id:"asc"}, skip, take:limit }),
      prisma.set.count({ where }),
    ]);
    return { data, meta:meta(total,page,limit) };
  }
  static async findById(id:string) {
    const s = await prisma.set.findUnique({ where:{id}, include:{siteExpedition:{include:{fournisseur:true}}, _count:{select:{correspondances:true,triages:true}}} });
    if (!s) throw new NotFoundError("SET");
    return s;
  }
  static async create(dto:CreateSetDto) {
    if (await prisma.set.findUnique({where:{id:dto.id}})) throw new ConflictError(`SET ${dto.id} déjà existant`);
    return prisma.set.create({ data:dto });
  }
  static async update(id:string, dto:UpdateSetDto) {
    if (!await prisma.set.findUnique({where:{id}})) throw new NotFoundError("SET");
    return prisma.set.update({ where:{id}, data:dto });
  }
  static async delete(id:string) {
    const s = await prisma.set.findUnique({ where:{id}, include:{_count:{select:{triages:true}}} });
    if (!s) throw new NotFoundError("SET");
    if (s._count.triages>0) return prisma.set.update({ where:{id}, data:{isActif:false} });
    return prisma.set.delete({ where:{id} });
  }
}
