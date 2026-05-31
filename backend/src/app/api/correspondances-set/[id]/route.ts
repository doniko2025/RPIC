import { NextRequest } from "next/server";
import { ok, noContent, handleError } from "@/lib/response";
import { CorrespondanceSetService } from "@/services/correspondance-set.service";
import { UpdateCorrSchema } from "@/validators/correspondance-set.validator";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try { return ok(await CorrespondanceSetService.findById(params.id)); }
  catch (e) { return handleError(e); }
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dto = UpdateCorrSchema.parse(await req.json());
    return ok(await CorrespondanceSetService.update(params.id, dto));
  } catch (e) { return handleError(e); }
}
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try { await CorrespondanceSetService.obsoleter(params.id); return noContent(); }
  catch (e) { return handleError(e); }
}
