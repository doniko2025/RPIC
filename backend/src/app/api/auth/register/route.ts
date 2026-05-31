import { NextRequest } from "next/server";
import { created, handleError } from "@/lib/response";
import { AuthService } from "@/services/auth.service";
import { RegisterSchema } from "@/validators/auth.validator";

export async function POST(req: NextRequest) {
  try {
    const dto = RegisterSchema.parse(await req.json());
    return created(await AuthService.register(dto));
  } catch (e) { return handleError(e); }
}
