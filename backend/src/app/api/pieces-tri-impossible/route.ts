import { NextRequest } from "next/server";
import { paginated, created, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { PieceTriImpossibleService } from "@/services/piece-tri-impossible.service";
import { CreateTriImpSchema } from "@/validators/piece-tri-impossible.validator";

export async function GET(req: NextRequest) {
  try {
    const { data, meta } = await PieceTriImpossibleService.findAll(req.nextUrl.searchParams);
    return paginated(data, meta);
  } catch (e) { return handleError(e); }
}
export async function POST(req: NextRequest) {
  try {
    const { userId } = getUserCtx(req);
    const dto = CreateTriImpSchema.parse(await req.json());
    return created(await PieceTriImpossibleService.create(dto, userId));
  } catch (e) { return handleError(e); }
}
