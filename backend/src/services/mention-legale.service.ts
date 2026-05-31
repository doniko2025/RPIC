import { prisma } from "@/lib/prisma";
import { NotFoundError, ConflictError } from "@/lib/errors";
import type { CreateMentionDto, UpdateMentionDto } from "@/validators/mention-legale.validator";

export class MentionLegaleService {
  static findAll() { return prisma.mentionLegale.findMany({ orderBy:{createdAt:"desc"} }); }
  static async findActive() {
    const m = await prisma.mentionLegale.findFirst({ where:{isActive:true}, orderBy:{createdAt:"desc"} });
    if (!m) throw new NotFoundError("Mention légale active");
    return m;
  }
  static async findById(id:string) {
    const m = await prisma.mentionLegale.findUnique({where:{id}});
    if (!m) throw new NotFoundError("Mention légale");
    return m;
  }
  static async create(dto:CreateMentionDto) {
    if (await prisma.mentionLegale.findUnique({where:{version:dto.version}})) throw new ConflictError("Version déjà existante");
    if (dto.isActive) await prisma.mentionLegale.updateMany({ data:{isActive:false} });
    return prisma.mentionLegale.create({ data:dto });
  }
  static async update(id:string, dto:UpdateMentionDto) {
    if (!await prisma.mentionLegale.findUnique({where:{id}})) throw new NotFoundError("Mention légale");
    return prisma.mentionLegale.update({ where:{id}, data:dto });
  }
  static async accepter(userId:string) {
    const m = await this.findActive();
    return prisma.user.update({ where:{id:userId}, data:{acceptedRgpdAt:new Date(),rgpdVersion:m.version} });
  }
  static async delete(id:string) {
    if (!await prisma.mentionLegale.findUnique({where:{id}})) throw new NotFoundError("Mention légale");
    return prisma.mentionLegale.delete({ where:{id} });
  }
}
