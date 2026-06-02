//backend/src/app/api/notifications/unread-count/route.ts
import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { NotificationService } from "@/services/notification.service";

export async function GET(req: NextRequest) {
  try {
    const { userId } = getUserCtx(req);
    const count = await NotificationService.countUnread(userId);
    return ok({ count });
  } catch (e) { return handleError(e); }
}