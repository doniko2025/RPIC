import { NextRequest } from "next/server";
import { paginated, created, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { SetService } from "@/services/set.service";
import { CreateSetSchema } from "@/validators/set.validator";

export async function GET(req: NextRequest) {
  try {
    const { data, meta } = await SetService.findAll(req.nextUrl.searchParams);
    return paginated(data, meta);
  } catch (e) { return handleError(e); }
}
export async function POST(req: NextRequest) {
  try {
    const user = getUserCtx(req);
    const dto  = CreateSetSchema.parse(await req.json());
    return created(await SetService.create(dto as never));
  } catch (e) { return handleError(e); }
}
