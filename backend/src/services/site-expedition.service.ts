import { prisma } from "@/lib/prisma";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { pagination, meta } from "@/lib/response";
import type { CreateSiteDto, UpdateSiteDto } from "@/validators/site-expedition.validator";

export class SiteExpeditionService {
  static async findAll(sp:URLSearchParams) {
    const { page,limit,skip } = pagination(sp);
    const search  = sp.get("search")||undefined;
    const fId     = sp.get("fournisseurId")||undefined;
    const isActif = sp.get("isActif");
    const where   = {
      ...(fId && { fournisseurId:fId }),
      ...(isActif!==null && { isActif:isActif==="true" }),
      ...(search && { OR:[{nom:{contains:search,mode:"insensitive" as const}},{code6Plus2:{contains:search}}] }),
    };
    const [data,total] = await Promise.all([
      prisma.siteExpedition.findMany({ where, include:{fournisseur:{select:{id:true,nom:true}}}, orderBy:{nom:"asc"}, skip, take:limit }),
      prisma.siteExpedition.count({ where }),
    ]);
    return { data, meta:meta(total,page,limit) };
  }
  static async findById(id:string) {
    const s = await prisma.siteExpedition.findUnique({ where:{id}, include:{fournisseur:true, sets:true} });
    if (!s) throw new NotFoundError("Site d'expédition");
    return s;
  }
  static async findByCode(code:string) {
    const s = await prisma.siteExpedition.findUnique({ where:{code6Plus2:code.toUpperCase()}, include:{fournisseur:true} });
    if (!s) throw new NotFoundError("Site d'expédition");
    return s;
  }
  static async create(dto:CreateSiteDto) {
    if (await prisma.siteExpedition.findUnique({where:{code6Plus2:dto.code6Plus2}})) throw new ConflictError("Code 6+2 déjà utilisé");
    return prisma.siteExpedition.create({ data:dto });
  }
  static async update(id:string, dto:UpdateSiteDto) {
    if (!await prisma.siteExpedition.findUnique({where:{id}})) throw new NotFoundError("Site d'expédition");
    return prisma.siteExpedition.update({ where:{id}, data:dto });
  }
  static async delete(id:string) {
    if (!await prisma.siteExpedition.findUnique({where:{id}})) throw new NotFoundError("Site d'expédition");
    return prisma.siteExpedition.delete({ where:{id} });
  }
}
