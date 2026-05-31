import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/response";
import { CorrespondanceSetService } from "@/services/correspondance-set.service";
import { ConfirmerSchema } from "@/validators/correspondance-set.validator";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { piloteId } = ConfirmerSchema.parse(await req.json());
    return ok(await CorrespondanceSetService.confirmer(params.id, piloteId));
  } catch (e) { return handleError(e); }
}
