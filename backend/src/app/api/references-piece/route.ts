import { NextRequest } from "next/server";
import { paginated, created, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { ReferencePieceService } from "@/services/reference-piece.service";
import { CreateRefSchema } from "@/validators/reference-piece.validator";

export async function GET(req: NextRequest) {
  try {
    const { data, meta } = await ReferencePieceService.findAll(req.nextUrl.searchParams);
    return paginated(data, meta);
  } catch (e) { return handleError(e); }
}
export async function POST(req: NextRequest) {
  try {
    const user = getUserCtx(req);
    const dto  = CreateRefSchema.parse(await req.json());
    return created(await ReferencePieceService.create(dto as never));
  } catch (e) { return handleError(e); }
}
