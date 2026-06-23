//backend/src/app/api/auth/logout/route.ts
import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { AuthService } from "@/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getUserCtx(req);
    const { refreshToken } = await req.json();
    await AuthService.logout(refreshToken, userId);
    return ok({ message: "Déconnecté" });
  } catch (e) { return handleError(e); }
}
