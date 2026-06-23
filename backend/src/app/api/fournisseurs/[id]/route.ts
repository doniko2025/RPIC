//backend/src/app/api/fournisseurs/[id]/route.ts
import { NextRequest } from "next/server";
import { ok, noContent, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { FournisseurService } from "@/services/fournisseur.service";
import { UpdateFournisseurSchema } from "@/validators/fournisseur.validator";
import { ForbiddenError } from "@/lib/errors";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try { return ok(await FournisseurService.findById(params.id)); }
  catch (e) { return handleError(e); }
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dto = UpdateFournisseurSchema.parse(await req.json());
    return ok(await FournisseurService.update(params.id, dto as never));
  } catch (e) { return handleError(e); }
}
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { role } = getUserCtx(req);
    if (role !== "ADMIN" && role !== "MANAGER") throw new ForbiddenError();
    await FournisseurService.delete(params.id);
    return noContent();
  } catch (e) { return handleError(e); }
}
