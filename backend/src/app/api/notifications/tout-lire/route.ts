import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { NotificationService } from "@/services/notification.service";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getUserCtx(req);
    await NotificationService.markAllRead(userId);
    return ok({ message: "Toutes les notifications marquées comme lues" });
  } catch (e) { return handleError(e); }
}
