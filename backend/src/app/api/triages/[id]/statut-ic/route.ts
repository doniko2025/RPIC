import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/response";
import { PieceTriageService } from "@/services/piece-triage.service";
import { z } from "zod";

const S = z.object({ statut: z.enum(["EN_KARDEX","EN_ANALYSE","A_REEXPEDIER","REEXPEDIE","CAFFUTE"]) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { statut } = S.parse(await req.json());
    return ok(await PieceTriageService.updateStatutIC(params.id, statut));
  } catch (e) { return handleError(e); }
}
