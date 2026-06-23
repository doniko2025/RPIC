//backend/src/app/api/anomalies/[id]/route.ts
import { NextRequest } from "next/server";
import { ok, noContent, handleError } from "@/lib/response";
import { AnomalieService } from "@/services/anomalie.service";
import { UpdateAnomalieSchema } from "@/validators/anomalie.validator";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try { return ok(await AnomalieService.findById(params.id)); }
  catch (e) { return handleError(e); }
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dto = UpdateAnomalieSchema.parse(await req.json());
    return ok(await AnomalieService.update(params.id, dto));
  } catch (e) { return handleError(e); }
}
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try { await AnomalieService.delete(params.id); return noContent(); }
  catch (e) { return handleError(e); }
}
