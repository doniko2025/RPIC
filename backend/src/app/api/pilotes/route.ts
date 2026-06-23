//backend/src/app/api/pilotes/route.ts
import { NextRequest } from "next/server";
import { paginated, created, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { PiloteService } from "@/services/pilote.service";
import { CreatePiloteSchema } from "@/validators/pilote.validator";

export async function GET(req: NextRequest) {
  try {
    const { data, meta } = await PiloteService.findAll(req.nextUrl.searchParams);
    return paginated(data, meta);
  } catch (e) { return handleError(e); }
}
export async function POST(req: NextRequest) {
  try {
    getUserCtx(req); // vérification auth — userId non requis dans ce handler
    const dto = CreatePiloteSchema.parse(await req.json());
    return created(await PiloteService.create(dto as never));
  } catch (e) { return handleError(e); }
}