import { NextRequest } from "next/server";
import { paginated, created, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { RetourExpeditionService } from "@/services/retour-expedition.service";
import { CreateRetourSchema } from "@/validators/retour-expedition.validator";

export async function GET(req: NextRequest) {
  try {
    const { data, meta } = await RetourExpeditionService.findAll(req.nextUrl.searchParams);
    return paginated(data, meta);
  } catch (e) { return handleError(e); }
}
export async function POST(req: NextRequest) {
  try {
    const { userId } = getUserCtx(req);
    const dto = CreateRetourSchema.parse(await req.json());
    return created(await RetourExpeditionService.create(dto, userId));
  } catch (e) { return handleError(e); }
}
