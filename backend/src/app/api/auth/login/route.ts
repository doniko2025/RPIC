//backend/src/app/api/auth/login/route.ts
import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/response";
import { AuthService } from "@/services/auth.service";
import { LoginSchema } from "@/validators/auth.validator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dto  = LoginSchema.parse(body);
    const ip   = req.headers.get("x-forwarded-for") ?? undefined;
    const ua   = req.headers.get("user-agent") ?? undefined;
    const result = await AuthService.login(dto, ip, ua);
    return ok(result);
  } catch (e) { return handleError(e); }
}
