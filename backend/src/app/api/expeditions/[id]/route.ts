import { NextRequest } from "next/server";
import { ok, noContent, handleError } from "@/lib/response";
import { ExpeditionService } from "@/services/expedition.service";
import { UpdateExpSchema } from "@/validators/expedition.validator";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try { return ok(await ExpeditionService.findById(params.id)); }
  catch (e) { return handleError(e); }
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dto = UpdateExpSchema.parse(await req.json());
    return ok(await ExpeditionService.update(params.id, dto));
  } catch (e) { return handleError(e); }
}
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try { await ExpeditionService.delete(params.id); return noContent(); }
  catch (e) { return handleError(e); }
}
