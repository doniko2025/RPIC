//backend/src/app/api/auth/reset-password/request/route.ts
import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/response";
import { AuthService } from "@/services/auth.service";
import { ResetRequestSchema } from "@/validators/auth.validator";

export async function POST(req: NextRequest) {
  try {
    const { email } = ResetRequestSchema.parse(await req.json());
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    await AuthService.requestReset(email, base);
    return ok({ message: "Si cet email existe, un lien a été envoyé." });
  } catch (e) { return handleError(e); }
}
