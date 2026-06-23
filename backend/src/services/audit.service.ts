//backend/src/services/audit.service.ts
import { prisma } from "@/lib/prisma";
import { pagination, meta } from "@/lib/response";
import type { Prisma } from "@prisma/client";

export interface LogData {
  action: string;
  entite?: string;
  entiteId?: string;
  details: string;
  anciennesValeurs?: Record<string, unknown>;
  nouvellesValeurs?: Record<string, unknown>;
  userId?: string;
  userEmail?: string;
  ipAdresse?: string;
  userAgent?: string;
  methodeHttp?: string;
  endpoint?: string;
}

export class AuditService {
  // FIX : Prisma génère deux variantes du type create (AuditLogCreateInput avec
  // relation imbriquée, et AuditLogUncheckedCreateInput avec FK directe).
  // LogData utilise userId:string directement → cast vers Unchecked pour lever
  // l'incompatibilité sur userId et sur les champs Json (anciennesValeurs, etc.).
  static log(d: LogData) {
    return prisma.auditLog.create({ data: d as Prisma.AuditLogUncheckedCreateInput });
  }

  static async findAll(sp: URLSearchParams) {
    const { page, limit, skip } = pagination(sp);
    const userId = sp.get("userId") || undefined;
    const action = sp.get("action") || undefined;
    const entite = sp.get("entite") || undefined;
    const where = {
      ...(userId && { userId }),
      ...(action && { action: { contains: action, mode: "insensitive" as const } }),
      ...(entite && { entite }),
    };
    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { nom: true, prenom: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);
    return { data, meta: meta(total, page, limit) };
  }
}