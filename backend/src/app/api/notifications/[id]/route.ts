//backend/src/app/api/notifications/[id]/route.ts
import { NextRequest } from "next/server";
import { ok, noContent, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { NotificationService } from "@/services/notification.service";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = getUserCtx(req);
    await NotificationService.markRead(params.id, userId);
    return ok({ message: "Lu" });
  } catch (e) { return handleError(e); }
}
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = getUserCtx(req);
    await NotificationService.delete(params.id, userId);
    return noContent();
  } catch (e) { return handleError(e); }
}
