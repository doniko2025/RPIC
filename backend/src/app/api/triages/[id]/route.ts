//backend/src/app/api/triages/[id]/route.ts
import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { PieceTriageService } from "@/services/piece-triage.service";
import { UpdateTriageSchema } from "@/validators/piece-triage.validator";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try { return ok(await PieceTriageService.findById(params.id)); }
  catch (e) { return handleError(e); }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // FIX temporaire (Option B) : getUserCtx() sans capturer userId pour éviter
    // l'erreur ts(2554) "3 arguments, 2 attendus".
    // ✅ Pour activer l'Option A (recommandée avec audit) :
    //    1. Envoyer piece-triage.service.ts
    //    2. Ajouter `userId: string` en 3e param de PieceTriageService.update()
    //    3. Remplacer les deux lignes ci-dessous par :
    //       const { userId } = getUserCtx(req);
    //       return ok(await PieceTriageService.update(params.id, dto, userId));
    getUserCtx(req);
    const dto = UpdateTriageSchema.parse(await req.json());
    return ok(await PieceTriageService.update(params.id, dto));
  } catch (e) { return handleError(e); }
}