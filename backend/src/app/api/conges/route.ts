//backend/src/app/api/conges/route.ts
import { NextRequest } from "next/server";
import { created, paginated, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { prisma } from "@/lib/prisma";
import { pagination, meta } from "@/lib/response";
import { z } from "zod";

const CreateCongeSchema = z.object({
  dateDebut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateFin:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  motif:     z.string().optional(),
}).refine(
  (d) => new Date(d.dateFin) >= new Date(d.dateDebut),
  { message: "dateFin doit être >= dateDebut", path: ["dateFin"] }
);

export async function GET(req: NextRequest) {
  try {
    const { userId } = getUserCtx(req);
    const sp = req.nextUrl.searchParams;
    const { page, limit, skip } = pagination(sp);
    const where: Record<string, unknown> = { employeId: userId };
    if (sp.get("statut")) where.statut = sp.get("statut");
    const [data, total] = await Promise.all([
      prisma.conge.findMany({
        where,
        include: { employe: { select: { nom: true, prenom: true } } },
        orderBy: { dateDebut: "desc" },
        skip, take: limit,
      }),
      prisma.conge.count({ where }),
    ]);
    return paginated(data, meta(total, page, limit));
  } catch (e) { return handleError(e); }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getUserCtx(req);
    const dto = CreateCongeSchema.parse(await req.json());
    const conge = await prisma.conge.create({
      data: {
        dateDebut: new Date(dto.dateDebut),
        dateFin:   new Date(dto.dateFin),
        motif:     dto.motif,
        employeId: userId,
        statut:    "EN_ATTENTE",
      },
    });
    return created(conge);
  } catch (e) { return handleError(e); }
}