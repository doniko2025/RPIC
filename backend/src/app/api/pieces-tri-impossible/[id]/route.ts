import { NextRequest } from "next/server";
import { ok, noContent, handleError } from "@/lib/response";
import { PieceTriImpossibleService } from "@/services/piece-tri-impossible.service";
import { UpdateTriImpSchema } from "@/validators/piece-tri-impossible.validator";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try { return ok(await PieceTriImpossibleService.findById(params.id)); }
  catch (e) { return handleError(e); }
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dto = UpdateTriImpSchema.parse(await req.json());
    return ok(await PieceTriImpossibleService.update(params.id, dto));
  } catch (e) { return handleError(e); }
}
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try { await PieceTriImpossibleService.delete(params.id); return noContent(); }
  catch (e) { return handleError(e); }
}
