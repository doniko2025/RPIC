import { NextRequest } from "next/server";
import { ok, noContent, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { PiloteService } from "@/services/pilote.service";
import { UpdatePiloteSchema } from "@/validators/pilote.validator";
import { ForbiddenError } from "@/lib/errors";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try { return ok(await PiloteService.findById(params.id)); }
  catch (e) { return handleError(e); }
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dto = UpdatePiloteSchema.parse(await req.json());
    return ok(await PiloteService.update(params.id, dto as never));
  } catch (e) { return handleError(e); }
}
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { role } = getUserCtx(req);
    if (role !== "ADMIN" && role !== "MANAGER") throw new ForbiddenError();
    await PiloteService.delete(params.id);
    return noContent();
  } catch (e) { return handleError(e); }
}
