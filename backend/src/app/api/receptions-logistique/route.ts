//backend/src/app/api/receptions-logistique/route.ts
import { NextRequest } from "next/server";
import { paginated, created, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { ReceptionLogistiqueService } from "@/services/reception-logistique.service";
import { CreateReceptionSchema } from "@/validators/reception-logistique.validator";

export async function GET(req: NextRequest) {
  try {
    const { data, meta } = await ReceptionLogistiqueService.findAll(req.nextUrl.searchParams);
    return paginated(data, meta);
  } catch (e) { return handleError(e); }
}
export async function POST(req: NextRequest) {
  try {
    const { userId } = getUserCtx(req);
    const dto = CreateReceptionSchema.parse(await req.json());
    return created(await ReceptionLogistiqueService.create(dto, userId));
  } catch (e) { return handleError(e); }
}
