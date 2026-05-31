import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import { pagination, meta } from "@/lib/response";
import { NotificationService } from "./notification.service";
import type { CreateTriImpDto, UpdateTriImpDto } from "@/validators/piece-tri-impossible.validator";

export class PieceTriImpossibleService {
  static async findAll(sp:URLSearchParams) {
    const { page,limit,skip } = pagination(sp);
    const where:Record<string,unknown> = {};
    if (sp.get("statut"))            where.statut            = sp.get("statut");
    if (sp.get("typePiece"))         where.typePiece         = sp.get("typePiece");
    if (sp.get("categorieProbleme")) where.categorieProbleme = sp.get("categorieProbleme");
    const [data,total] = await Promise.all([
      prisma.pieceTriImpossible.findMany({ where, include:{signaleur:{select:{nom:true,prenom:true}},_count:{select:{commentaires:true}}}, orderBy:{createdAt:"desc"}, skip, take:limit }),
      prisma.pieceTriImpossible.count({ where }),
    ]);
    return { data, meta:meta(total,page,limit) };
  }
  static async findById(id:string) {
    const p = await prisma.pieceTriImpossible.findUnique({ where:{id}, include:{signaleur:{select:{nom:true,prenom:true}},commentaires:{orderBy:{createdAt:"asc"}}} });
    if (!p) throw new NotFoundError("Pièce tri impossible");
    return p;
  }
  static async create(dto:CreateTriImpDto, signaleurId:string) {
    const p = await prisma.pieceTriImpossible.create({ data:{...dto,signaleurId,dateConstat:new Date(dto.dateConstat)} });
    await NotificationService.notifyAdmins({ type:"PIECE_TRI_IMPOSSIBLE_SIGNALEE",
      titre:`Tri impossible — ${dto.nitg}`, message:dto.descriptionProbleme.substring(0,200),
      lienAction:`/pieces-tri-impossible/${p.id}` });
    return p;
  }
  static async update(id:string, dto:UpdateTriImpDto) {
    if (!await prisma.pieceTriImpossible.findUnique({where:{id}})) throw new NotFoundError("Pièce tri impossible");
    return prisma.pieceTriImpossible.update({ where:{id}, data:{...dto,...(dto.dateResolution&&{dateResolution:new Date(dto.dateResolution)})} });
  }
  static async addCommentaire(pieceId:string, contenu:string, auteurId:string, auteurNom:string) {
    if (!await prisma.pieceTriImpossible.findUnique({where:{id:pieceId}})) throw new NotFoundError("Pièce tri impossible");
    return prisma.commentaireTriImpossible.create({ data:{pieceTriImpossibleId:pieceId,contenu,auteurId,auteurNom} });
  }
  static async delete(id:string) {
    if (!await prisma.pieceTriImpossible.findUnique({where:{id}})) throw new NotFoundError("Pièce tri impossible");
    return prisma.pieceTriImpossible.delete({ where:{id} });
  }
}
