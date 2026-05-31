import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/response";
import { AlerteRCService } from "@/services/alerte-rc.service";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try { return ok(await AlerteRCService.findById(params.id)); }
  catch (e) { return handleError(e); }
}
