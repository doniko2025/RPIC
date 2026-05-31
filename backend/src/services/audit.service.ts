import { prisma } from "@/lib/prisma";
import { pagination, meta } from "@/lib/response";

export interface LogData {
  action:string; entite?:string; entiteId?:string; details:string;
  anciennesValeurs?:Record<string,unknown>; nouvellesValeurs?:Record<string,unknown>;
  userId?:string; userEmail?:string; ipAdresse?:string; userAgent?:string;
  methodeHttp?:string; endpoint?:string;
}
export class AuditService {
  static log(d: LogData) { return prisma.auditLog.create({ data: d }); }

  static async findAll(sp: URLSearchParams) {
    const { page, limit, skip } = pagination(sp);
    const userId = sp.get("userId")||undefined;
    const action = sp.get("action")||undefined;
    const entite = sp.get("entite")||undefined;
    const where = {
      ...(userId && { userId }),
      ...(action && { action:{ contains:action, mode:"insensitive" as const } }),
      ...(entite && { entite }),
    };
    const [data,total] = await Promise.all([
      prisma.auditLog.findMany({ where, include:{ user:{select:{nom:true,prenom:true}} },
        orderBy:{ createdAt:"desc" }, skip, take:limit }),
      prisma.auditLog.count({ where }),
    ]);
    return { data, meta: meta(total,page,limit) };
  }
}
