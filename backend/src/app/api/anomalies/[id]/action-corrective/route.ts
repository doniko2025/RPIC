//backend/src/app/api/anomalies/[id]/action-corrective/route.ts
import { NextRequest } from "next/server";
import { created, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { AnomalieService } from "@/services/anomalie.service";
import { ActionCorrectiveSchema } from "@/validators/anomalie.validator";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = getUserCtx(req);
    const { description } = ActionCorrectiveSchema.parse(await req.json());
    return created(await AnomalieService.addActionCorrective(params.id, description, userId));
  } catch (e) { return handleError(e); }
}
