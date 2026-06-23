//backend/src/app/api/mentions-legales/accepter/route.ts
import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { MentionLegaleService } from "@/services/mention-legale.service";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getUserCtx(req);
    return ok(await MentionLegaleService.accepter(userId));
  } catch (e) { return handleError(e); }
}
