//backend/src/app/api/notifications/route.ts
import { NextRequest } from "next/server";
import { paginated, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { NotificationService } from "@/services/notification.service";

export async function GET(req: NextRequest) {
  try {
    const { userId } = getUserCtx(req);
    const { data, meta } = await NotificationService.findAll(userId, req.nextUrl.searchParams);
    return paginated(data, meta);
  } catch (e) { return handleError(e); }
}
