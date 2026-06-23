//backend/src/services/garage.service.ts
import { prisma } from "@/lib/prisma";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { pagination, meta } from "@/lib/response";
import type { CreateGarageDto, UpdateGarageDto } from "@/validators/garage.validator";

export class GarageService {
  static async findAll(sp:URLSearchParams) {
    const { page,limit,skip } = pagination(sp);
    const search = sp.get("search")||undefined;
    const where  = search ? { OR:[{nom:{contains:search,mode:"insensitive" as const}},{ville:{contains:search,mode:"insensitive" as const}},{codeGarage:{contains:search}}] } : {};
    const [data,total] = await Promise.all([
      prisma.garage.findMany({ where, orderBy:{nom:"asc"}, skip, take:limit }),
      prisma.garage.count({ where }),
    ]);
    return { data, meta:meta(total,page,limit) };
  }
  static async findById(id:string) {
    const g = await prisma.garage.findUnique({where:{id}});
    if (!g) throw new NotFoundError("Garage");
    return g;
  }
  static async create(dto:CreateGarageDto) {
    if (dto.codeGarage && await prisma.garage.findUnique({where:{codeGarage:dto.codeGarage}})) throw new ConflictError("Code garage déjà utilisé");
    return prisma.garage.create({ data:dto });
  }
  static async update(id:string, dto:UpdateGarageDto) {
    if (!await prisma.garage.findUnique({where:{id}})) throw new NotFoundError("Garage");
    return prisma.garage.update({ where:{id}, data:dto });
  }
  static async delete(id:string) {
    if (!await prisma.garage.findUnique({where:{id}})) throw new NotFoundError("Garage");
    return prisma.garage.delete({ where:{id} });
  }
}
