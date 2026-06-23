//backend/src/app/api/conges/[id]/route.ts
import { NextRequest } from "next/server";
import { ok, noContent, handleError } from "@/lib/response";
import { CongeService } from "@/services/conge.service";
import { UpdateCongeSchema } from "@/validators/conge.validator";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try { return ok(await CongeService.findById(params.id)); }
  catch (e) { return handleError(e); }
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dto = UpdateCongeSchema.parse(await req.json());
    return ok(await CongeService.update(params.id, dto));
  } catch (e) { return handleError(e); }
}
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try { await CongeService.delete(params.id); return noContent(); }
  catch (e) { return handleError(e); }
}
