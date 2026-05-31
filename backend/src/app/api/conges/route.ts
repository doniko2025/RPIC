import { NextRequest } from "next/server";
import { paginated, created, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { CongeService } from "@/services/conge.service";
import { CreateCongeSchema } from "@/validators/conge.validator";

export async function GET(req: NextRequest) {
  try {
    const { userId, role } = getUserCtx(req);
    const { data, meta } = await CongeService.findAll(req.nextUrl.searchParams, role, userId);
    return paginated(data, meta);
  } catch (e) { return handleError(e); }
}
export async function POST(req: NextRequest) {
  try {
    const { userId } = getUserCtx(req);
    const dto = CreateCongeSchema.parse(await req.json());
    return created(await CongeService.create(dto, userId));
  } catch (e) { return handleError(e); }
}
