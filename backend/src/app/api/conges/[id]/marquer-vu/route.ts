//backend/src/app/api/conges/[id]/marquer-vu/route.ts
import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { CongeService } from "@/services/conge.service";
import { MarquerVuSchema } from "@/validators/conge.validator";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = getUserCtx(req);
    const { noteAdmin } = MarquerVuSchema.parse(await req.json());
    return ok(await CongeService.marquerVu(params.id, userId, noteAdmin));
  } catch (e) { return handleError(e); }
}
