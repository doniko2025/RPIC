//backend/src/app/api/mentions-legales/[id]/route.ts
import { NextRequest } from "next/server";
import { ok, noContent, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { MentionLegaleService } from "@/services/mention-legale.service";
import { UpdateMentionSchema } from "@/validators/mention-legale.validator";
import { ForbiddenError } from "@/lib/errors";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try { return ok(await MentionLegaleService.findById(params.id)); }
  catch (e) { return handleError(e); }
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { role } = getUserCtx(req);
    if (role !== "ADMIN") throw new ForbiddenError();
    const dto = UpdateMentionSchema.parse(await req.json());
    return ok(await MentionLegaleService.update(params.id, dto));
  } catch (e) { return handleError(e); }
}
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { role } = getUserCtx(req);
    if (role !== "ADMIN") throw new ForbiddenError();
    await MentionLegaleService.delete(params.id);
    return noContent();
  } catch (e) { return handleError(e); }
}
