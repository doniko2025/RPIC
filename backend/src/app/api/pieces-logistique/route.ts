import { NextRequest } from "next/server";
import { paginated, created, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { PieceLogistiqueService } from "@/services/piece-logistique.service";
import { CreatePieceLogSchema } from "@/validators/piece-logistique.validator";

export async function GET(req: NextRequest) {
  try {
    const { data, meta } = await PieceLogistiqueService.findAll(req.nextUrl.searchParams);
    return paginated(data, meta);
  } catch (e) { return handleError(e); }
}
export async function POST(req: NextRequest) {
  try {
    const { userId } = getUserCtx(req);
    const dto = CreatePieceLogSchema.parse(await req.json());
    return created(await PieceLogistiqueService.create(dto, userId));
  } catch (e) { return handleError(e); }
}
