//backend/src/app/api/users/[id]/route.ts
import { NextRequest } from "next/server";
import { ok, noContent, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { UserService } from "@/services/user.service";
import { UpdateUserSchema } from "@/validators/user.validator";
import { ForbiddenError } from "@/lib/errors";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try { return ok(await UserService.findById(params.id)); }
  catch (e) { return handleError(e); }
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, role } = getUserCtx(req);
    if (role !== "ADMIN" && userId !== params.id) throw new ForbiddenError();
    const dto = UpdateUserSchema.parse(await req.json());
    return ok(await UserService.update(params.id, dto, userId));
  } catch (e) { return handleError(e); }
}
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, role } = getUserCtx(req);
    if (role !== "ADMIN") throw new ForbiddenError();
    await UserService.delete(params.id, userId);
    return noContent();
  } catch (e) { return handleError(e); }
}
