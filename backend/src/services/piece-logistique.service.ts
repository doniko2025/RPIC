//backend/src/services/piece-logistique.service.ts
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import { pagination, meta } from "@/lib/response";
import type { CreatePieceLogDto, UpdatePieceLogDto } from "@/validators/piece-logistique.validator";

export class PieceLogistiqueService {
  static async findAll(sp:URLSearchParams) {
    const { page,limit,skip } = pagination(sp);
    const where:Record<string,unknown> = {};
    if (sp.get("typePiece"))    where.typePiece    = sp.get("typePiece");
    if (sp.get("fournisseurId"))where.fournisseurId= sp.get("fournisseurId");
    const [data,total] = await Promise.all([
      prisma.pieceLogistique.findMany({ where, include:{fournisseur:{select:{id:true,nom:true}},recepteur:{select:{nom:true,prenom:true}}}, orderBy:{dateArrivee:"desc"}, skip, take:limit }),
      prisma.pieceLogistique.count({ where }),
    ]);
    return { data, meta:meta(total,page,limit) };
  }
  static async findById(id:string) {
    const p = await prisma.pieceLogistique.findUnique({ where:{id}, include:{fournisseur:true,recepteur:{select:{nom:true,prenom:true}}} });
    if (!p) throw new NotFoundError("Pièce logistique");
    return p;
  }
  static async create(dto:CreatePieceLogDto, recepteurId:string) {
    return prisma.pieceLogistique.create({ data:{...dto,recepteurId,dateArrivee:dto.dateArrivee?new Date(dto.dateArrivee):new Date()} });
  }
  static async update(id:string, dto:UpdatePieceLogDto) {
    if (!await prisma.pieceLogistique.findUnique({where:{id}})) throw new NotFoundError("Pièce logistique");
    return prisma.pieceLogistique.update({ where:{id}, data:dto });
  }
  static async delete(id:string) {
    if (!await prisma.pieceLogistique.findUnique({where:{id}})) throw new NotFoundError("Pièce logistique");
    return prisma.pieceLogistique.delete({ where:{id} });
  }
}
