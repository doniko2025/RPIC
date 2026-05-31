import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/response";
import { AuthService } from "@/services/auth.service";
import { RefreshSchema } from "@/validators/auth.validator";

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = RefreshSchema.parse(await req.json());
    return ok(await AuthService.refresh(refreshToken));
  } catch (e) { return handleError(e); }
}
