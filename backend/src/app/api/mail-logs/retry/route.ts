import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { MailService } from "@/services/mail.service";
import { ForbiddenError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const { role } = getUserCtx(req);
    if (role !== "ADMIN") throw new ForbiddenError();
    await MailService.retry();
    return ok({ message: "Relance des mails en échec effectuée" });
  } catch (e) { return handleError(e); }
}
