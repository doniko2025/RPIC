//backend/src/services/correspondance-set.service.ts
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import { pagination, meta } from "@/lib/response";
import { genCle } from "@/lib/cle-set";
import { NotificationService } from "./notification.service";
import type { CreateCorrDto, UpdateCorrDto, SearchCorrDto } from "@/validators/correspondance-set.validator";

const INC = {
  set:{ include:{ siteExpedition:{ include:{ fournisseur:true } } } },
  siteExpedition:{ include:{ fournisseur:true } },
  fournisseur:{ select:{ id:true, nom:true, delaiExpeMaxRC:true } },
  referencePiece:{ select:{ id:true,nomPiece:true,photo1:true,photo2:true,photo3:true,photo4:true,inscriptionSurPiece:true,conclusionDeTri:true } },
};

export class CorrespondanceSetService {
  /** RECHERCHE PRINCIPALE — retourne les correspondances classées par fiabilité */
  static async search(dto:SearchCorrDto) {
    const where = {
      nitg: dto.nitg.toUpperCase(),
      statut: { notIn: ["OBSOLETE" as const] },
      ...(dto.refPieceCause && { refPieceCause:dto.refPieceCause.toUpperCase() }),
      ...(dto.typePiece     && { typePiece:dto.typePiece }),
      ...(dto.projetVehicule && { projetVehicule:{ contains:dto.projetVehicule,mode:"insensitive" as const } }),
      ...(dto.projetMoteur   && { projetMoteur:{ contains:dto.projetMoteur,mode:"insensitive" as const } }),
      ...(dto.projetBoite    && { projetBoite:{ contains:dto.projetBoite,mode:"insensitive" as const } }),
    };
    const list = await prisma.correspondanceSet.findMany({
      where, include:INC, orderBy:[{nbConfirmations:"desc"},{derniereConfirmationAt:"desc"}],
    });
    return { count:list.length, unique:list.length===1, correspondances:list };
  }

  /** UPSERT depuis un tri — auto-apprentissage */
  static async upsertFromTriage(dto:CreateCorrDto, userId?:string) {
    const cle = genCle(dto);
    const ex  = await prisma.correspondanceSet.findUnique({ where:{cleUnique:cle} });

    if (ex) {
      if (ex.setId===dto.setId) {
        // Confirmation
        const upd = await prisma.correspondanceSet.update({ where:{cleUnique:cle}, data:{
          nbConfirmations:{ increment:1 }, derniereConfirmationAt:new Date(),
          statut: ex.nbConfirmations>=2 ? "CONFIRMEE" : ex.statut,
        }, include:INC });
        return { action:"CONFIRMED" as const, correspondance:upd };
      }
      // Conflit
      await prisma.correspondanceSetConflit.create({ data:{
        correspondanceId:ex.id, setAttendu:ex.setId, setObserve:dto.setId, signaleParId:userId,
      }});
      await prisma.correspondanceSet.update({ where:{id:ex.id}, data:{ statut:"EN_CONFLIT", nbInfirmations:{increment:1} } });
      if (userId) await NotificationService.create({ userId, type:"CORRESPONDANCE_EN_CONFLIT",
        titre:`Conflit SET — ${dto.nitg}`, message:`SET attendu ${ex.setId}, observé ${dto.setId}`, lienAction:`/correspondances/${ex.id}` });
      return { action:"CONFLICT" as const, correspondance:ex };
    }

    const created = await prisma.correspondanceSet.create({ data:{ ...dto, cleUnique:cle, creeeParId:userId, statut:"PROPOSEE", nbConfirmations:1 }, include:INC });
    return { action:"CREATED" as const, correspondance:created };
  }

  static async findAll(sp:URLSearchParams) {
    const { page,limit,skip } = pagination(sp);
    const nitg   = sp.get("nitg")||undefined;
    const statut = sp.get("statut") as "PROPOSEE"|"CONFIRMEE"|"EN_CONFLIT"|"OBSOLETE"|undefined;
    const fId    = sp.get("fournisseurId")||undefined;
    const where  = {
      ...(nitg   && { nitg:nitg.toUpperCase() }),
      ...(statut && { statut }),
      ...(fId    && { fournisseurId:fId }),
    };
    const [data,total] = await Promise.all([
      prisma.correspondanceSet.findMany({ where, include:INC, orderBy:{nbConfirmations:"desc"}, skip, take:limit }),
      prisma.correspondanceSet.count({ where }),
    ]);
    return { data, meta:meta(total,page,limit) };
  }

  static async findById(id:string) {
    const c = await prisma.correspondanceSet.findUnique({ where:{id}, include:{...INC,conflits:true} });
    if (!c) throw new NotFoundError("Correspondance SET");
    return c;
  }

  static async update(id:string, dto:UpdateCorrDto) {
    if (!await prisma.correspondanceSet.findUnique({where:{id}})) throw new NotFoundError("Correspondance SET");
    return prisma.correspondanceSet.update({ where:{id}, data:dto, include:INC });
  }

  static async confirmer(id:string, piloteId?:string) {
    if (!await prisma.correspondanceSet.findUnique({where:{id}})) throw new NotFoundError("Correspondance SET");
    return prisma.correspondanceSet.update({ where:{id}, data:{ statut:"CONFIRMEE",
      confirmeeParPiloteId:piloteId, confirmeeAt:new Date(), nbConfirmations:{increment:1} }, include:INC });
  }

  static async obsoleter(id:string) {
    if (!await prisma.correspondanceSet.findUnique({where:{id}})) throw new NotFoundError("Correspondance SET");
    return prisma.correspondanceSet.update({ where:{id}, data:{statut:"OBSOLETE"} });
  }

  static async getConflits(sp:URLSearchParams) {
    const { page,limit,skip } = pagination(sp);
    const resolu = sp.get("resolu");
    const where  = { ...(resolu!==null && { resolu:resolu==="true" }) };
    const [data,total] = await Promise.all([
      prisma.correspondanceSetConflit.findMany({ where, include:{correspondance:{include:{set:true}}}, orderBy:{createdAt:"desc"}, skip, take:limit }),
      prisma.correspondanceSetConflit.count({ where }),
    ]);
    return { data, meta:meta(total,page,limit) };
  }

  static async resoudreConflit(id:string, note:string) {
    return prisma.correspondanceSetConflit.update({ where:{id}, data:{resolu:true,noteResolution:note} });
  }
}
