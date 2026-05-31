import { NextRequest } from "next/server";
import { paginated, created, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { UserService } from "@/services/user.service";
import { CreateUserSchema } from "@/validators/user.validator";
import { ForbiddenError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const { data, meta } = await UserService.findAll(req.nextUrl.searchParams);
    return paginated(data, meta);
  } catch (e) { return handleError(e); }
}
export async function POST(req: NextRequest) {
  try {
    const { userId, role } = getUserCtx(req);
    if (role !== "ADMIN") throw new ForbiddenError();
    const dto = CreateUserSchema.parse(await req.json());
    return created(await UserService.create(dto, userId));
  } catch (e) { return handleError(e); }
}
