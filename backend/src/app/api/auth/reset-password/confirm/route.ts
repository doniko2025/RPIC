import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/response";
import { AuthService } from "@/services/auth.service";
import { ResetConfirmSchema } from "@/validators/auth.validator";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = ResetConfirmSchema.parse(await req.json());
    await AuthService.confirmReset(token, password);
    return ok({ message: "Mot de passe réinitialisé" });
  } catch (e) { return handleError(e); }
}
