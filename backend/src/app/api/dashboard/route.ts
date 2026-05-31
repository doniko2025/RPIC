import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { StatsService } from "@/services/stats.service";
import { NotificationService } from "@/services/notification.service";
import { AlerteRCService } from "@/services/alerte-rc.service";

export async function GET(req: NextRequest) {
  try {
    const { userId } = getUserCtx(req);
    const [dashboard, unread, alertes] = await Promise.all([
      StatsService.getDashboard(),
      NotificationService.countUnread(userId),
      AlerteRCService.countActive(),
    ]);
    return ok({ ...dashboard, notificationsNonLues: unread, alertesRCActives: alertes });
  } catch (e) { return handleError(e); }
}
