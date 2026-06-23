//backend/src/app/api/sets/[id]/route.ts
import { NextRequest } from "next/server";
import { ok, noContent, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { SetService } from "@/services/set.service";
import { UpdateSetSchema } from "@/validators/set.validator";
import { ForbiddenError } from "@/lib/errors";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try { return ok(await SetService.findById(params.id)); }
  catch (e) { return handleError(e); }
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dto = UpdateSetSchema.parse(await req.json());
    return ok(await SetService.update(params.id, dto as never));
  } catch (e) { return handleError(e); }
}
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { role } = getUserCtx(req);
    if (role !== "ADMIN" && role !== "MANAGER") throw new ForbiddenError();
    await SetService.delete(params.id);
    return noContent();
  } catch (e) { return handleError(e); }
}
