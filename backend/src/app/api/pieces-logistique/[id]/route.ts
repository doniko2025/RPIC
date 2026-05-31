import { NextRequest } from "next/server";
import { ok, noContent, handleError } from "@/lib/response";
import { PieceLogistiqueService } from "@/services/piece-logistique.service";
import { UpdatePieceLogSchema } from "@/validators/piece-logistique.validator";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try { return ok(await PieceLogistiqueService.findById(params.id)); }
  catch (e) { return handleError(e); }
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dto = UpdatePieceLogSchema.parse(await req.json());
    return ok(await PieceLogistiqueService.update(params.id, dto));
  } catch (e) { return handleError(e); }
}
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try { await PieceLogistiqueService.delete(params.id); return noContent(); }
  catch (e) { return handleError(e); }
}
