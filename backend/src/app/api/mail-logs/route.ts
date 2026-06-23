//backend/src/app/api/mail-logs/route.ts
import { NextRequest } from "next/server";
import { paginated, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { MailService } from "@/services/mail.service";
import { ForbiddenError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const { role } = getUserCtx(req);
    if (role !== "ADMIN") throw new ForbiddenError();
    const { data, meta } = await MailService.findAll(req.nextUrl.searchParams);
    return paginated(data, meta);
  } catch (e) { return handleError(e); }
}
