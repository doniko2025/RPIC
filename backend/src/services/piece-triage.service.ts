import { prisma } from "@/lib/prisma";
import { NotFoundError, AppError } from "@/lib/errors";
import { pagination, meta } from "@/lib/response";
import { calcMax } from "@/lib/utils";
import { CorrespondanceSetService } from "./correspondance-set.service";
import { AuditService } from "./audit.service";
import type { CreateTriageDto, UpdateTriageDto, CaffuterDto } from "@/validators/piece-triage.validator";

const INC = {
  referencePiece:{ select:{nomPiece:true,photo1:true,photo2:true,photo3:true,photo4:true} },
  correspondanceSet:{ include:{ set:true, siteExpedition:true, fournisseur:true } },
  set:true, siteExpedition:true,
  fournisseur:{ select:{id:true,nom:true,delaiExpeMaxRC:true} },
  garageOrigine:true, pilote:true,
  agentTri:{ select:{id:true,nom:true,prenom:true} },
  alerteRC:{ select:{statut:true,joursRestants:true,dateMaxExpedition:true} },
};

export class PieceTriageService {
  static async findAll(sp:URLSearchParams) {
    const { page,limit,skip } = pagination(sp);
    const where:Record<string,unknown> = {};
    if (sp.get("typePiece"))     where.typePiece     = sp.get("typePiece");
    if (sp.get("statutRC"))      where.statutRC      = sp.get("statutRC");
    if (sp.get("statutIC"))      where.statutIC      = sp.get("statutIC");
    if (sp.get("agentTriId"))    where.agentTriId    = sp.get("agentTriId");
    if (sp.get("fournisseurId")) where.fournisseurId = sp.get("fournisseurId");
    if (sp.get("caffute")!==null) where.caffute      = sp.get("caffute")==="true";
    if (sp.get("nitg"))          where.nitgSaisi     = { contains:sp.get("nitg")!.toUpperCase() };
    if (sp.get("dateDebut")||sp.get("dateFin"))
      where.dateTri = { ...(sp.get("dateDebut")&&{gte:new Date(sp.get("dateDebut")!)}), ...(sp.get("dateFin")&&{lte:new Date(sp.get("dateFin")!)}) };
    const [data,total] = await Promise.all([
      prisma.pieceTriage.findMany({ where, include:{
        fournisseur:{select:{id:true,nom:true}}, set:{select:{id:true}},
        siteExpedition:{select:{id:true,nom:true,code6Plus2:true}},
        agentTri:{select:{id:true,nom:true,prenom:true}},
        alerteRC:{select:{statut:true,joursRestants:true}},
      }, orderBy:{dateTri:"desc"}, skip, take:limit }),
      prisma.pieceTriage.count({ where }),
    ]);
    return { data, meta:meta(total,page,limit) };
  }

  static async findById(id:string) {
    const t = await prisma.pieceTriage.findUnique({ where:{id}, include:INC });
    if (!t) throw new NotFoundError("Triage");
    return t;
  }

  static async search(sp:URLSearchParams) {
    const { page,limit,skip } = pagination(sp);
    const nitg = sp.get("nitg")||undefined;
    const ref  = sp.get("ref")||undefined;
    const vin  = sp.get("vin")||undefined;
    const where = {
      ...(nitg && { nitgSaisi:{ startsWith:nitg.toUpperCase() } }),
      ...(ref  && { refPieceCauseSaisie:{ startsWith:ref.toUpperCase() } }),
      ...(vin  && { vin:{ contains:vin,mode:"insensitive" as const } }),
    };
    const [data,total] = await Promise.all([
      prisma.pieceTriage.findMany({ where, include:{ set:true, siteExpedition:true,
        fournisseur:{select:{id:true,nom:true}}, referencePiece:{select:{photo1:true,photo2:true}} },
        orderBy:{dateTri:"desc"}, skip, take:limit }),
      prisma.pieceTriage.count({ where }),
    ]);
    return { data, meta:meta(total,page,limit) };
  }

  static async create(dto:CreateTriageDto, agentTriId:string) {
    let dateMaxExpeditionRC: Date|undefined;
    let correspondanceSetId = dto.correspondanceSetId;

    if (dto.typePiece==="RC") {
      let delai = 7;
      if (dto.fournisseurId) {
        const f = await prisma.fournisseur.findUnique({ where:{id:dto.fournisseurId} });
        delai = f?.delaiExpeMaxRC ?? 7;
      }
      dateMaxExpeditionRC = calcMax(new Date(), delai);
    }

    // Auto-apprentissage
    if (dto.nitgSaisi && dto.refPieceCauseSaisie && dto.setId) {
      const res = await CorrespondanceSetService.upsertFromTriage({
        nitg:dto.nitgSaisi, refPieceCause:dto.refPieceCauseSaisie, typePiece:dto.typePiece,
        setId:dto.setId, projetVehicule:dto.projetVehicule, indiceVehicule:dto.indiceVehicule,
        projetMoteur:dto.projetMoteur, indiceMoteur:dto.indiceMoteur,
        projetBoite:dto.projetBoite, indiceBoite:dto.indiceBoite,
        siteExpeditionId:dto.siteExpeditionId, fournisseurId:dto.fournisseurId,
        codeRef6Plus2:dto.codeRef6Plus2, referencePieceId:dto.referencePieceId,
      }, agentTriId);
      correspondanceSetId = res.correspondance.id;
    }

    const triage = await prisma.pieceTriage.create({ data:{
      ...dto, agentTriId, correspondanceSetId, dateMaxExpeditionRC,
      dateTri:new Date(),
      statutRC: dto.typePiece==="RC" ? "EN_ATTENTE_EXPEDITION" : undefined,
      statutIC: dto.typePiece==="IC" ? "EN_KARDEX"             : undefined,
    }, include:INC });

    await AuditService.log({ action:"TRIAGE_CREATE",entite:"PieceTriage",entiteId:triage.id,
      details:`${dto.typePiece} — ${dto.nitgSaisi}`,userId:agentTriId });
    return triage;
  }

  static async update(id:string, dto:UpdateTriageDto, actorId?:string) {
    if (!await prisma.pieceTriage.findUnique({where:{id}})) throw new NotFoundError("Triage");
    return prisma.pieceTriage.update({ where:{id}, data:dto, include:INC });
  }

  static async caffuter(id:string, dto:CaffuterDto, userId:string) {
    const t = await prisma.pieceTriage.findUnique({where:{id}});
    if (!t)          throw new NotFoundError("Triage");
    if (t.typePiece!=="IC") throw new AppError("Seules les pièces IC peuvent être caffutées",400);
    if (t.caffute)   throw new AppError("Pièce déjà caffutée",409);
    const upd = await prisma.pieceTriage.update({ where:{id}, data:{
      caffute:true, caffutageMotif:dto.motif, caffuteParUserId:userId, caffuteAt:new Date(), statutIC:"CAFFUTE",
    }, include:INC });
    await AuditService.log({ action:"TRIAGE_CAFFUTER",entite:"PieceTriage",entiteId:id,details:dto.motif,userId });
    return upd;
  }

  static async updateStatutRC(id:string, statut:string) {
    const t = await prisma.pieceTriage.findUnique({where:{id}});
    if (!t) throw new NotFoundError("Triage");
    if (t.typePiece!=="RC") throw new AppError("Pièce non RC",400);
    return prisma.pieceTriage.update({ where:{id}, data:{statutRC:statut as never} });
  }

  static async updateStatutIC(id:string, statut:string) {
    const t = await prisma.pieceTriage.findUnique({where:{id}});
    if (!t) throw new NotFoundError("Triage");
    if (t.typePiece!=="IC") throw new AppError("Pièce non IC",400);
    return prisma.pieceTriage.update({ where:{id}, data:{statutIC:statut as never} });
  }
}
