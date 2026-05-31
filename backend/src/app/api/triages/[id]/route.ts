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
    const { userId } = getUserCtx(req);
    const dto = UpdateTriageSchema.parse(await req.json());
    return ok(await PieceTriageService.update(params.id, dto, userId));
  } catch (e) { return handleError(e); }
}
