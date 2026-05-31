import { NextRequest } from "next/server";
import { ok, noContent, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { GarageService } from "@/services/garage.service";
import { UpdateGarageSchema } from "@/validators/garage.validator";
import { ForbiddenError } from "@/lib/errors";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try { return ok(await GarageService.findById(params.id)); }
  catch (e) { return handleError(e); }
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dto = UpdateGarageSchema.parse(await req.json());
    return ok(await GarageService.update(params.id, dto as never));
  } catch (e) { return handleError(e); }
}
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { role } = getUserCtx(req);
    if (role !== "ADMIN" && role !== "MANAGER") throw new ForbiddenError();
    await GarageService.delete(params.id);
    return noContent();
  } catch (e) { return handleError(e); }
}
