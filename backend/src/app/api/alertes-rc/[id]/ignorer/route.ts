import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { AlerteRCService } from "@/services/alerte-rc.service";
import { z } from "zod";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = getUserCtx(req);
    const { note } = z.object({ note: z.string().optional() }).parse(await req.json());
    return ok(await AlerteRCService.ignorer(params.id, userId, note));
  } catch (e) { return handleError(e); }
}
