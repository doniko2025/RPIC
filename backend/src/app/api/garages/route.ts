import { NextRequest } from "next/server";
import { paginated, created, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { GarageService } from "@/services/garage.service";
import { CreateGarageSchema } from "@/validators/garage.validator";

export async function GET(req: NextRequest) {
  try {
    const { data, meta } = await GarageService.findAll(req.nextUrl.searchParams);
    return paginated(data, meta);
  } catch (e) { return handleError(e); }
}
export async function POST(req: NextRequest) {
  try {
    const user = getUserCtx(req);
    const dto  = CreateGarageSchema.parse(await req.json());
    return created(await GarageService.create(dto as never));
  } catch (e) { return handleError(e); }
}
