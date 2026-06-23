//backend/src/app/api/auth/change-password/route.ts
import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { AuthService } from "@/services/auth.service";
import { ChangePasswordSchema } from "@/validators/auth.validator";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getUserCtx(req);
    const dto = ChangePasswordSchema.parse(await req.json());
    await AuthService.changePassword(userId, dto);
    return ok({ message: "Mot de passe modifié" });
  } catch (e) { return handleError(e); }
}
