import { NextRequest } from "next/server";
import { ok, noContent, handleError } from "@/lib/response";
import { RetourExpeditionService } from "@/services/retour-expedition.service";
import { UpdateRetourSchema } from "@/validators/retour-expedition.validator";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try { return ok(await RetourExpeditionService.findById(params.id)); }
  catch (e) { return handleError(e); }
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dto = UpdateRetourSchema.parse(await req.json());
    return ok(await RetourExpeditionService.update(params.id, dto));
  } catch (e) { return handleError(e); }
}
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try { await RetourExpeditionService.delete(params.id); return noContent(); }
  catch (e) { return handleError(e); }
}
