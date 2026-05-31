import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { UserService } from "@/services/user.service";
import { ForbiddenError } from "@/lib/errors";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, role } = getUserCtx(req);
    if (role !== "ADMIN") throw new ForbiddenError();
    return ok(await UserService.toggleActive(params.id, userId));
  } catch (e) { return handleError(e); }
}
