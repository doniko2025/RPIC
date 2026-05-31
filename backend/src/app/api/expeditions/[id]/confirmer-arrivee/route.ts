import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/response";
import { ExpeditionService } from "@/services/expedition.service";

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  try { return ok(await ExpeditionService.confirmerArrivee(params.id)); }
  catch (e) { return handleError(e); }
}
