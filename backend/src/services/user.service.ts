import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { pagination, meta } from "@/lib/response";
import { AuditService } from "./audit.service";
import type { CreateUserDto, UpdateUserDto } from "@/validators/user.validator";

const SAFE = {
  id:true,email:true,nom:true,prenom:true,telephone:true,role:true,
  matricule:true,lieuTravail:true,poste:true,typePrincipal:true,
  isActive:true,lastLoginAt:true,createdAt:true,updatedAt:true,
  adresseLigne1:true,adresseLigne2:true,codePostal:true,ville:true,pays:true,
};

export class UserService {
  static async findAll(sp:URLSearchParams) {
    const { page,limit,skip } = pagination(sp);
    const search = sp.get("search")||undefined;
    const role   = sp.get("role") as "ADMIN"|"MANAGER"|"EMPLOYEE"|undefined;
    const where  = {
      ...(role && { role }),
      ...(sp.get("isActive")!==null && { isActive: sp.get("isActive")==="true" }),
      ...(search && { OR:[
        { nom:{contains:search,mode:"insensitive" as const} },
        { prenom:{contains:search,mode:"insensitive" as const} },
        { email:{contains:search,mode:"insensitive" as const} },
      ]}),
    };
    const [data,total] = await Promise.all([
      prisma.user.findMany({ where, select:SAFE, orderBy:{nom:"asc"}, skip, take:limit }),
      prisma.user.count({ where }),
    ]);
    return { data, meta:meta(total,page,limit) };
  }

  static async findById(id:string) {
    const u = await prisma.user.findUnique({ where:{id}, select:{...SAFE, pilote:true} });
    if (!u) throw new NotFoundError("Utilisateur");
    return u;
  }

  static async create(dto:CreateUserDto, createdById?:string) {
    const ex = await prisma.user.findUnique({ where:{email:dto.email} });
    if (ex) throw new ConflictError("Email déjà utilisé");
    const { password,...rest } = dto;
    const u = await prisma.user.create({ data:{...rest,password:await hashPassword(password),createdById}, select:SAFE });
    await AuditService.log({ action:"USER_CREATE",entite:"User",entiteId:u.id,details:`Création ${u.email}`,userId:createdById });
    return u;
  }

  static async update(id:string, dto:UpdateUserDto, actorId?:string) {
    if (!await prisma.user.findUnique({where:{id}})) throw new NotFoundError("Utilisateur");
    const u = await prisma.user.update({ where:{id}, data:dto, select:SAFE });
    await AuditService.log({ action:"USER_UPDATE",entite:"User",entiteId:id,details:"Mise à jour",userId:actorId });
    return u;
  }

  static async toggleActive(id:string, actorId?:string) {
    const u = await prisma.user.findUnique({where:{id}});
    if (!u) throw new NotFoundError("Utilisateur");
    const upd = await prisma.user.update({ where:{id}, data:{isActive:!u.isActive}, select:SAFE });
    await AuditService.log({ action:upd.isActive?"USER_ACTIVATE":"USER_DEACTIVATE",entite:"User",entiteId:id,details:"Statut modifié",userId:actorId });
    return upd;
  }

  static async delete(id:string, actorId?:string) {
    const u = await prisma.user.findUnique({where:{id}});
    if (!u) throw new NotFoundError("Utilisateur");
    await prisma.user.delete({where:{id}});
    await AuditService.log({ action:"USER_DELETE",entite:"User",entiteId:id,details:`Suppression ${u.email}`,userId:actorId });
  }
}
