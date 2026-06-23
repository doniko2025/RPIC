//backend/src/app/api/mentions-legales/route.ts
import { NextRequest } from "next/server";
import { ok, created, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { MentionLegaleService } from "@/services/mention-legale.service";
import { CreateMentionSchema } from "@/validators/mention-legale.validator";
import { ForbiddenError } from "@/lib/errors";

export async function GET() {
  try { return ok(await MentionLegaleService.findAll()); }
  catch (e) { return handleError(e); }
}
export async function POST(req: NextRequest) {
  try {
    const { role } = getUserCtx(req);
    if (role !== "ADMIN") throw new ForbiddenError();
    const dto = CreateMentionSchema.parse(await req.json());
    return created(await MentionLegaleService.create(dto));
  } catch (e) { return handleError(e); }
}
