import { NextRequest } from "next/server";
import { ok, noContent, handleError } from "@/lib/response";
import { ReceptionLogistiqueService } from "@/services/reception-logistique.service";
import { UpdateReceptionSchema } from "@/validators/reception-logistique.validator";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try { return ok(await ReceptionLogistiqueService.findById(params.id)); }
  catch (e) { return handleError(e); }
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dto = UpdateReceptionSchema.parse(await req.json());
    return ok(await ReceptionLogistiqueService.update(params.id, dto));
  } catch (e) { return handleError(e); }
}
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try { await ReceptionLogistiqueService.delete(params.id); return noContent(); }
  catch (e) { return handleError(e); }
}
