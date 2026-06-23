//backend/src/app/api/retours-expedition/[id]/traiter/route.ts
import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/response";
import { RetourExpeditionService } from "@/services/retour-expedition.service";

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  try { return ok(await RetourExpeditionService.traiter(params.id)); }
  catch (e) { return handleError(e); }
}
