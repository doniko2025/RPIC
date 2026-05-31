import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { AuthService } from "@/services/auth.service";

export async function GET(req: NextRequest) {
  try {
    const { userId } = getUserCtx(req);
    return ok(await AuthService.me(userId));
  } catch (e) { return handleError(e); }
}
