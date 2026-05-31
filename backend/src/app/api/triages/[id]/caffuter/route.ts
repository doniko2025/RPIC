import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { PieceTriageService } from "@/services/piece-triage.service";
import { CaffuterSchema } from "@/validators/piece-triage.validator";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = getUserCtx(req);
    const dto = CaffuterSchema.parse(await req.json());
    return ok(await PieceTriageService.caffuter(params.id, dto, userId));
  } catch (e) { return handleError(e); }
}
