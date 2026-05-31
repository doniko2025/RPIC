import { prisma } from "@/lib/prisma";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { pagination, meta } from "@/lib/response";
import type { CreateRefDto, UpdateRefDto } from "@/validators/reference-piece.validator";

export class ReferencePieceService {
  static async findAll(sp:URLSearchParams) {
    const { page,limit,skip } = pagination(sp);
    const nitg   = sp.get("nitg")||undefined;
    const type   = sp.get("typePiece") as "RC"|"IC"|undefined;
    const fId    = sp.get("fournisseurId")||undefined;
    const search = sp.get("search")||undefined;
    const where  = {
      ...(nitg  && { nitg:{contains:nitg.toUpperCase()} }),
      ...(type  && { typePiece:type }),
      ...(fId   && { fournisseurId:fId }),
      ...(search && { OR:[{nomPiece:{contains:search,mode:"insensitive" as const}},{nitg:{contains:search.toUpperCase()}},{refPieceCause:{contains:search.toUpperCase()}}] }),
    };
    const [data,total] = await Promise.all([
      prisma.referencePiece.findMany({ where, include:{fournisseur:{select:{id:true,nom:true}}}, orderBy:{nitg:"asc"}, skip, take:limit }),
      prisma.referencePiece.count({ where }),
    ]);
    return { data, meta:meta(total,page,limit) };
  }
  static async findById(id:string) {
    const r = await prisma.referencePiece.findUnique({ where:{id}, include:{fournisseur:true, correspondances:{include:{set:true,siteExpedition:true},take:10}} });
    if (!r) throw new NotFoundError("Référence pièce");
    return r;
  }
  static async findByRef(ref:string) {
    const r = await prisma.referencePiece.findUnique({ where:{refPieceCause:ref.toUpperCase()}, include:{fournisseur:true} });
    if (!r) throw new NotFoundError("Référence pièce");
    return r;
  }
  static async create(dto:CreateRefDto) {
    if (await prisma.referencePiece.findUnique({where:{refPieceCause:dto.refPieceCause}})) throw new ConflictError("Référence pièce cause déjà existante");
    return prisma.referencePiece.create({ data:dto });
  }
  static async update(id:string, dto:UpdateRefDto) {
    if (!await prisma.referencePiece.findUnique({where:{id}})) throw new NotFoundError("Référence pièce");
    return prisma.referencePiece.update({ where:{id}, data:dto });
  }
  static async delete(id:string) {
    if (!await prisma.referencePiece.findUnique({where:{id}})) throw new NotFoundError("Référence pièce");
    return prisma.referencePiece.delete({ where:{id} });
  }
}
