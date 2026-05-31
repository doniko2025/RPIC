import { NextRequest } from "next/server";
import { paginated, created, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { AnomalieService } from "@/services/anomalie.service";
import { CreateAnomalieSchema } from "@/validators/anomalie.validator";

export async function GET(req: NextRequest) {
  try {
    const { data, meta } = await AnomalieService.findAll(req.nextUrl.searchParams);
    return paginated(data, meta);
  } catch (e) { return handleError(e); }
}
export async function POST(req: NextRequest) {
  try {
    const { userId } = getUserCtx(req);
    const dto = CreateAnomalieSchema.parse(await req.json());
    return created(await AnomalieService.create(dto, userId));
  } catch (e) { return handleError(e); }
}
